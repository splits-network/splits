'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader, AdminLoadingState, AdminErrorState } from '@/components/shared';

type TicketReply = {
    id: string;
    sender_type: string;
    body: string;
    created_at: string;
};

type Ticket = {
    id: string;
    subject: string | null;
    body: string;
    category: string;
    status: string;
    source_app: string;
    visitor_name: string | null;
    visitor_email: string | null;
    visitor_session_id: string;
    clerk_user_id: string | null;
    assigned_admin_id: string | null;
    admin_notes: string | null;
    page_url: string | null;
    user_agent: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    replies: TicketReply[];
};

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

const STATUS_BADGE: Record<string, string> = {
    open: 'badge-warning',
    in_progress: 'badge-info',
    resolved: 'badge-success',
    closed: 'badge-ghost',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex gap-4 py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/50 w-36 flex-shrink-0">{label}</span>
            <span className="text-sm flex-1">{value ?? <span className="text-base-content/30">—</span>}</span>
        </div>
    );
}

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const fetchTicket = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) { setError('Not authenticated'); setLoading(false); return; }
            const client = createAuthenticatedClient(token);
            const res = await client.get(`/support/admin/support/tickets/${id}`);
            setTicket((res as any).data || res);
        } catch {
            setError('Failed to load ticket');
        } finally {
            setLoading(false);
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchTicket(); }, [fetchTicket]);

    const handleReply = async () => {
        if (!replyBody.trim()) return;
        setSending(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/support/admin/support/tickets/${id}/reply`, { body: replyBody });
            setReplyBody('');
            await fetchTicket();
        } catch {
            // toast would go here
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (status: string) => {
        setUpdatingStatus(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(`/support/admin/support/tickets/${id}`, { status });
            await fetchTicket();
        } catch {
            // toast would go here
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/support/admin/support/tickets/${id}/claim`, {});
            await fetchTicket();
        } catch {
            // toast would go here
        } finally {
            setClaiming(false);
        }
    };

    if (loading) return <div className="p-6"><AdminLoadingState /></div>;
    if (error || !ticket) return <div className="p-6"><AdminErrorState message={error ?? 'Ticket not found'} /></div>;

    return (
        <div>
            <button
                className="btn btn-ghost btn-sm gap-2 mb-3"
                onClick={() => router.push('/secure/support-tickets')}
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back to Tickets
            </button>

            <AdminPageHeader
                title={ticket.subject || `Ticket #${ticket.id.substring(0, 8)}`}
                subtitle={`Created ${formatDate(ticket.created_at)}`}
                actions={
                    <div className="flex items-center gap-2">
                        <span className={`badge badge-lg ${STATUS_BADGE[ticket.status] ?? 'badge-ghost'}`}>
                            {ticket.status.replace('_', ' ')}
                        </span>
                        {!ticket.assigned_admin_id && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={handleClaim}
                                disabled={claiming}
                            >
                                {claiming ? <span className="loading loading-spinner loading-xs" /> : <i className="fa-duotone fa-regular fa-hand mr-1" />}
                                Claim
                            </button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Original message */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base">Original Message</h3>
                            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                                {ticket.body}
                            </p>
                        </div>
                    </div>

                    {/* Replies timeline */}
                    {ticket.replies && ticket.replies.length > 0 && (
                        <div className="card bg-base-100 border border-base-200">
                            <div className="card-body">
                                <h3 className="card-title text-base">
                                    Replies ({ticket.replies.length})
                                </h3>
                                <div className="space-y-4">
                                    {ticket.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={`p-3 rounded-lg ${
                                                reply.sender_type === 'admin'
                                                    ? 'bg-primary/5 border-l-2 border-primary'
                                                    : 'bg-base-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium capitalize">
                                                    {reply.sender_type}
                                                </span>
                                                <span className="text-sm text-base-content/50">
                                                    {formatDate(reply.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{reply.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reply form */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base">Reply</h3>
                            <textarea
                                className="textarea textarea-bordered w-full min-h-24"
                                placeholder="Type your reply..."
                                value={replyBody}
                                onChange={(e) => setReplyBody(e.target.value)}
                            />
                            <div className="card-actions justify-end mt-2">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleReply}
                                    disabled={sending || !replyBody.trim()}
                                >
                                    {sending ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                                    )}
                                    Send Reply
                                </button>
                            </div>
                            {ticket.visitor_email && (
                                <p className="text-sm text-base-content/50 mt-1">
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    Reply will be emailed to {ticket.visitor_email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Ticket info */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base">Details</h3>
                            <div>
                                <InfoRow label="Ticket ID" value={<span className="font-mono text-sm">{ticket.id.substring(0, 8)}</span>} />
                                <InfoRow label="Category" value={<span className="badge badge-sm badge-ghost capitalize">{ticket.category}</span>} />
                                <InfoRow label="Source" value={<span className="badge badge-sm badge-primary">{ticket.source_app}</span>} />
                                <InfoRow label="Visitor" value={ticket.visitor_name || 'Anonymous'} />
                                <InfoRow label="Email" value={ticket.visitor_email} />
                                <InfoRow label="Authenticated" value={ticket.clerk_user_id ? 'Yes' : 'No'} />
                                {ticket.page_url && (
                                    <InfoRow
                                        label="Page URL"
                                        value={
                                            <a href={ticket.page_url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm truncate block max-w-48">
                                                {ticket.page_url}
                                            </a>
                                        }
                                    />
                                )}
                                <InfoRow label="Created" value={formatDate(ticket.created_at)} />
                                {ticket.resolved_at && (
                                    <InfoRow label="Resolved" value={formatDate(ticket.resolved_at)} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status management */}
                    <div className="card bg-base-100 border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base">Status</h3>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => handleStatusChange(s)}
                                        disabled={updatingStatus || ticket.status === s}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
