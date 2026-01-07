'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useStandardList } from '@/hooks/use-standard-list';
import { useToast } from '@/lib/toast-context';
import ConfirmDialog from '@/components/confirm-dialog';
import { formatDate } from '@/lib/utils';

interface RecruiterCandidate {
    id: string;
    recruiter_id: string;
    candidate_id: string;
    relationship_start_date: string;
    relationship_end_date: string;
    status: 'active' | 'expired' | 'terminated';
    invited_at?: string;
    invitation_expires_at?: string;
    consent_given: boolean;
    consent_given_at?: string;
    declined_at?: string;
    declined_reason?: string;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
        phone?: string;
        verification_status: string;
    };
    recruiter_name?: string;
    recruiter_email?: string;
}

interface InvitationFilters {
    invitation_status: string;
}

type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined';

export default function InvitationsPageClient() {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();

    // Action state
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Send new invitation state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [candidateEmail, setCandidateEmail] = useState('');
    const [sendingInvitation, setSendingInvitation] = useState(false);

    // Client-side status filter (for tabs)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const fetchInvitations = async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);

        // V2 endpoint with enriched candidate data in single query
        const response = await client.get('/recruiter-candidates', { params });

        return {
            data: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit: 25, total_pages: 0 }
        };
    };

    const {
        data: invitations,
        loading,
        error,
        pagination,
        searchQuery,
        handleSearch,
        handlePageChange,
        refetch
    } = useStandardList<RecruiterCandidate, InvitationFilters>({
        fetchFn: fetchInvitations,
        defaultFilters: { invitation_status: '' },
        defaultSortBy: 'invited_at',
        defaultSortOrder: 'desc',
        storageKey: 'invitationsViewMode'
    });

    // Compute stats from full data
    const stats = useMemo(() => {
        const pending = invitations.filter(i => !i.consent_given && !i.declined_at).length;
        const accepted = invitations.filter(i => i.consent_given).length;
        const declined = invitations.filter(i => i.declined_at != null).length;

        return {
            total: pagination.total,
            pending,
            accepted,
            declined
        };
    }, [invitations, pagination.total]);

    // Apply client-side status filter for tabs
    const filteredInvitations = useMemo(() => {
        return invitations.filter((inv) => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'accepted') return inv.consent_given === true;
            if (statusFilter === 'declined') return inv.declined_at != null;
            if (statusFilter === 'pending') return !inv.consent_given && !inv.declined_at;
            return true;
        });
    }, [invitations, statusFilter]);

    const getStatusBadge = (invitation: RecruiterCandidate) => {
        if (invitation.consent_given) {
            return (
                <span className="badge badge-success gap-2">
                    <i className="fa-solid fa-check"></i> Accepted
                </span>
            );
        }

        if (invitation.declined_at) {
            return (
                <span className="badge badge-error gap-2">
                    <i className="fa-solid fa-times"></i> Declined
                </span>
            );
        }

        const isExpired = invitation.invitation_expires_at &&
            new Date(invitation.invitation_expires_at) < new Date();

        if (isExpired) {
            return (
                <span className="badge badge-warning gap-2">
                    <i className="fa-solid fa-clock"></i> Expired
                </span>
            );
        }

        return (
            <span className="badge badge-info gap-2">
                <i className="fa-solid fa-hourglass-half"></i> Pending
            </span>
        );
    };

    const canResendInvitation = (invitation: RecruiterCandidate) => {
        return !invitation.consent_given && !invitation.declined_at;
    };

    const handleResendInvitation = async (invitationId: string) => {
        try {
            setResendingId(invitationId);

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.post(`/recruiter-candidates/${invitationId}/resend-invitation`);

            await refetch();
            toast.success('Invitation resent successfully');
        } catch (err: any) {
            console.error('Failed to resend invitation:', err);
            toast.error(err.response?.data?.error || err.message || 'Failed to resend invitation');
        } finally {
            setResendingId(null);
        }
    };

    const handleCancelInvitation = (invitation: RecruiterCandidate) => {
        const candidateName = invitation.candidate?.full_name || 'this candidate';

        setConfirmDialog({
            isOpen: true,
            title: 'Cancel Invitation',
            message: `Are you sure you want to cancel the invitation for ${candidateName}? This action cannot be undone.`,
            onConfirm: () => confirmCancelInvitation(invitation)
        });
    };

    const confirmCancelInvitation = async (invitation: RecruiterCandidate) => {
        try {
            setCancellingId(invitation.id);
            setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.delete(`/recruiter-candidates/${invitation.id}`);

            await refetch();
            toast.success('Invitation cancelled');
        } catch (err: any) {
            console.error('Failed to cancel invitation:', err);
            toast.error(err.response?.data?.error || err.message || 'Failed to cancel invitation');
        } finally {
            setCancellingId(null);
        }
    };

    const handleSendNewInvitation = async () => {
        if (!candidateEmail.trim()) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setSendingInvitation(true);

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.post('/recruiter-candidates', {
                candidate_email: candidateEmail.trim(),
                send_invitation: true
            });

            setShowInviteModal(false);
            setCandidateEmail('');
            await refetch();
            toast.success('Invitation sent successfully');
        } catch (err: any) {
            console.error('Failed to send invitation:', err);
            toast.error(err.response?.data?.error || err.message || 'Failed to send invitation');
        } finally {
            setSendingInvitation(false);
        }
    };

    // Loading state
    if (loading && invitations.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Candidate Invitations</h1>
                    <p className="text-base-content/70 mt-2">
                        Track the status of invitations you've sent to candidates
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary gap-2"
                    onClick={() => setShowInviteModal(true)}
                >
                    <i className="fa-solid fa-paper-plane"></i>
                    Send Invitation
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                    <button className="btn btn-sm btn-ghost" onClick={refetch}>
                        <i className="fa-solid fa-rotate"></i>
                        Retry
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-figure">
                            <i className="fa-solid fa-envelopes text-3xl"></i>
                        </div>
                        <div className="stat-title">Total Invitations</div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-desc">Total candidate invitations</div>
                    </div>
                </div>
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <i className="fa-solid fa-hourglass-half text-3xl"></i>
                        </div>
                        <div className="stat-title">Pending</div>
                        <div className="stat-value text-info">{stats.pending}</div>
                        <div className="stat-desc">Awaiting response</div>
                    </div>
                </div>
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <i className="fa-solid fa-check text-3xl"></i>
                        </div>
                        <div className="stat-title">Accepted</div>
                        <div className="stat-value text-success">{stats.accepted}</div>
                        <div className="stat-desc">Candidates joined</div>
                    </div>
                </div>
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-error">
                            <i className="fa-solid fa-xmark text-3xl"></i>
                        </div>
                        <div className="stat-title">Declined</div>
                        <div className="stat-value text-error">{stats.declined}</div>
                        <div className="stat-desc">Not interested</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Tabs */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="tabs tabs-box">
                    <button
                        className={`tab ${statusFilter === 'all' ? 'tab-active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All ({pagination.total})
                    </button>
                    <button
                        className={`tab ${statusFilter === 'pending' ? 'tab-active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        className={`tab ${statusFilter === 'accepted' ? 'tab-active' : ''}`}
                        onClick={() => setStatusFilter('accepted')}
                    >
                        Accepted ({stats.accepted})
                    </button>
                    <button
                        className={`tab ${statusFilter === 'declined' ? 'tab-active' : ''}`}
                        onClick={() => setStatusFilter('declined')}
                    >
                        Declined ({stats.declined})
                    </button>
                </div>

                <div className="form-control w-full lg:w-auto">
                    <div className="input-group">
                        <span className="bg-base-200 px-3 flex items-center">
                            <i className="fa-solid fa-search"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by candidate name or email..."
                            className="input w-full lg:w-80"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Results summary */}
            {!loading && filteredInvitations.length > 0 && (
                <div className="text-sm text-base-content/70">
                    Showing {filteredInvitations.length} of {pagination.total} invitations
                </div>
            )}

            {/* Loading overlay */}
            {loading && invitations.length > 0 && (
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            )}

            {/* Table */}
            {filteredInvitations.length > 0 ? (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Email</th>
                                    <th>Invited</th>
                                    <th>Expires</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvitations.map((invitation) => (
                                    <tr key={invitation.id}>
                                        <td>
                                            <div className="font-bold">
                                                {invitation.candidate?.full_name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td>{invitation.candidate?.email || 'N/A'}</td>
                                        <td>{formatDate(invitation.invited_at)}</td>
                                        <td>
                                            {invitation.invitation_expires_at ? (
                                                <span
                                                    className={
                                                        new Date(invitation.invitation_expires_at) < new Date()
                                                            ? 'text-warning'
                                                            : ''
                                                    }
                                                >
                                                    {formatDate(invitation.invitation_expires_at)}
                                                </span>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td>{getStatusBadge(invitation)}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => router.push(`/candidates/${invitation.candidate_id}`)}
                                                    title="View candidate"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                                {canResendInvitation(invitation) && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleResendInvitation(invitation.id)}
                                                            disabled={resendingId === invitation.id || cancellingId === invitation.id}
                                                            title="Resend invitation"
                                                        >
                                                            {resendingId === invitation.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-solid fa-paper-plane"></i>
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-error btn-outline"
                                                            onClick={() => handleCancelInvitation(invitation)}
                                                            disabled={resendingId === invitation.id || cancellingId === invitation.id}
                                                            title="Cancel invitation"
                                                        >
                                                            {cancellingId === invitation.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-solid fa-trash"></i>
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                                {invitation.declined_reason && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => toast.info(invitation.declined_reason || 'No reason provided')}
                                                        title="View decline reason"
                                                    >
                                                        <i className="fa-solid fa-comment"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-inbox text-6xl text-base-content/20 mb-4"></i>
                        <h3 className="text-xl font-semibold">No invitations found</h3>
                        <p className="text-base-content/70">
                            {statusFilter === 'all'
                                ? 'Start adding candidates to send invitations'
                                : `No ${statusFilter} invitations at this time`}
                        </p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-base-content/70">
                                Page {pagination.page} of {pagination.total_pages}
                            </div>
                            <div className="join">
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1 || loading}
                                >
                                    <i className="fa-solid fa-angles-left"></i>
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                >
                                    <i className="fa-solid fa-angle-left"></i>
                                </button>
                                <button className="join-item btn btn-sm btn-disabled">
                                    {pagination.page}
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.total_pages || loading}
                                >
                                    <i className="fa-solid fa-angle-right"></i>
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(pagination.total_pages)}
                                    disabled={pagination.page === pagination.total_pages || loading}
                                >
                                    <i className="fa-solid fa-angles-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } })}
                confirmText="Cancel Invitation"
                cancelText="Keep Invitation"
                type="error"
                loading={cancellingId !== null}
            />

            {/* Send Invitation Modal */}
            {showInviteModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Send Invitation to Candidate</h3>
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setCandidateEmail('');
                                }}
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>

                        <div className="fieldset mb-4">
                            <label className="label">Candidate Email *</label>
                            <input
                                type="email"
                                className="input w-full"
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                                placeholder="candidate@example.com"
                                disabled={sendingInvitation}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendNewInvitation();
                                    }
                                }}
                            />
                            <label className="label">
                                <span className="label-text-alt">
                                    Enter the email address of the candidate you want to invite
                                </span>
                            </label>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setCandidateEmail('');
                                }}
                                disabled={sendingInvitation}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSendNewInvitation}
                                disabled={sendingInvitation || !candidateEmail.trim()}
                            >
                                {sendingInvitation ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane"></i>
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop"
                        onClick={() => {
                            if (!sendingInvitation) {
                                setShowInviteModal(false);
                                setCandidateEmail('');
                            }
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
}
