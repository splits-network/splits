/**
 * Proposals Table Component
 * 
 * Displays proposals in a table format with status badges, countdown timers,
 * and action buttons. Optimized for desktop viewing with responsive fallback.
 * 
 * @see docs/implementation-plans/proposals-workflow-ui-frontend.md
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Proposal {
    id: string;
    candidate_name?: string;
    candidate?: { name: string };
    job_title?: string;
    job?: { title: string };
    company_name?: string;
    company?: { name: string };
    state: 'proposed' | 'accepted' | 'declined' | 'timed_out';
    proposed_at?: string;
    created_at?: string;
    response_due_at: string;
    proposal_notes?: string;
}

interface ProposalsTableProps {
    proposals: Proposal[];
    onRefresh?: () => void;
    onWithdraw?: (id: string) => void;
}

/**
 * Status badge component for proposal states
 */
function StatusBadge({ state }: { state: Proposal['state'] }) {
    const configs = {
        proposed: { text: 'Pending', color: 'badge-warning', icon: 'fa-clock' },
        accepted: { text: 'Accepted', color: 'badge-success', icon: 'fa-check' },
        declined: { text: 'Declined', color: 'badge-error', icon: 'fa-times' },
        timed_out: { text: 'Expired', color: 'badge-neutral', icon: 'fa-hourglass-end' },
    };

    const config = configs[state] || configs.proposed;

    return (
        <span className={`badge ${config.color} gap-2`}>
            <i className={`fa-duotone fa-regular ${config.icon}`}></i>
            {config.text}
        </span>
    );
}

/**
 * Countdown timer component showing time remaining until response_due_at
 */
function CountdownTimer({ dueAt }: { dueAt: string }) {
    const dueDate = new Date(dueAt);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();

    // If expired
    if (diff <= 0) {
        return (
            <span className="text-error font-medium">
                <i className="fa-duotone fa-regular fa-exclamation-triangle mr-1"></i>
                Expired
            </span>
        );
    }

    // Calculate time remaining
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Show different colors based on urgency
    let colorClass = 'text-base-content';
    if (hours < 6) {
        colorClass = 'text-error font-bold';
    } else if (hours < 24) {
        colorClass = 'text-warning font-medium';
    }

    return (
        <span className={colorClass}>
            <i className="fa-duotone fa-regular fa-clock mr-1"></i>
            {hours}h {minutes}m
        </span>
    );
}

/**
 * Main ProposalsTable component
 */
export default function ProposalsTable({ proposals, onRefresh, onWithdraw }: ProposalsTableProps) {
    const router = useRouter();
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

    const handleView = (id: string) => {
        router.push(`/portal/proposals/${id}`);
    };

    const handleWithdraw = async (id: string) => {
        if (!confirm('Are you sure you want to withdraw this proposal?')) {
            return;
        }

        setWithdrawingId(id);
        try {
            if (onWithdraw) {
                await onWithdraw(id);
            }
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Failed to withdraw proposal:', error);
            alert('Failed to withdraw proposal. Please try again.');
        } finally {
            setWithdrawingId(null);
        }
    };

    if (proposals.length === 0) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center py-12">
                    <i className="fa-duotone fa-regular fa-inbox text-5xl text-base-content/30 mb-4"></i>
                    <h3 className="text-lg font-semibold">No proposals found</h3>
                    <p className="text-base-content/60">
                        Proposals you create will appear here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Job</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Time Remaining</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.map((proposal) => {
                            const candidateName = proposal.candidate_name || proposal.candidate?.name || 'Unknown';
                            const jobTitle = proposal.job_title || proposal.job?.title || 'Unknown Role';
                            const companyName = proposal.company_name || proposal.company?.name || '';
                            const createdAt = proposal.proposed_at || proposal.created_at || '';

                            return (
                                <tr key={proposal.id} className="hover">
                                    <td>
                                        <div className="font-medium">{candidateName}</div>
                                    </td>
                                    <td>
                                        <div className="font-medium">{jobTitle}</div>
                                        {companyName && (
                                            <div className="text-sm opacity-50">{companyName}</div>
                                        )}
                                    </td>
                                    <td>
                                        <StatusBadge state={proposal.state} />
                                    </td>
                                    <td>
                                        <span className="text-sm">
                                            {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        {proposal.state === 'proposed' ? (
                                            <CountdownTimer dueAt={proposal.response_due_at} />
                                        ) : (
                                            <span className="text-base-content/50">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleView(proposal.id)}
                                                title="View details"
                                            >
                                                <i className="fa-duotone fa-regular fa-eye"></i>
                                            </button>
                                            {proposal.state === 'proposed' && (
                                                <button
                                                    className="btn btn-sm btn-error btn-outline"
                                                    onClick={() => handleWithdraw(proposal.id)}
                                                    disabled={withdrawingId === proposal.id}
                                                    title="Withdraw proposal"
                                                >
                                                    {withdrawingId === proposal.id ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <i className="fa-duotone fa-regular fa-xmark"></i>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
