'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { LoadingState, useStandardList } from '@/hooks/use-standard-list';
import { useToast } from '@/lib/toast-context';
import ConfirmDialog from '@/components/confirm-dialog';
import { formatDate } from '@/lib/utils';
import { StatCard, StatCardGrid } from '@/components/ui/cards';

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

    // Memoize fetchInvitations to prevent infinite re-renders in useStandardList
    // const fetchInvitations = useCallback(async (params: Record<string, any>) => {
    //     const token = await getToken();
    //     if (!token) throw new Error('Not authenticated');

    //     const client = createAuthenticatedClient(token);

    //     params.include = 'candidate';
    //     // V2 endpoint with enriched candidate data in single query
    //     const response = await client.get('/recruiter-candidates', { params });

    //     return {
    //         data: response.data || [],
    //         pagination: response.pagination || { total: 0, page: 1, limit: 25, total_pages: 0 }
    //     };
    // }, [getToken]);

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<InvitationFilters>(() => ({
        invitation_status: ''
    }), []);

    const {
        data: invitations,
        pagination,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        viewMode,
        setViewMode,
        refresh,
    } = useStandardList<RecruiterCandidate, InvitationFilters>({
        endpoint: '/recruiter-candidates',
        //fetchFn: fetchInvitations,
        defaultFilters,
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
                    <i className="fa-duotone fa-regular fa-check"></i> Accepted
                </span>
            );
        }

        if (invitation.declined_at) {
            return (
                <span className="badge badge-error gap-2">
                    <i className="fa-duotone fa-regular fa-times"></i> Declined
                </span>
            );
        }

        const isExpired = invitation.invitation_expires_at &&
            new Date(invitation.invitation_expires_at) < new Date();

        if (isExpired) {
            return (
                <span className="badge badge-warning gap-2">
                    <i className="fa-duotone fa-regular fa-clock"></i> Expired
                </span>
            );
        }

        return (
            <span className="badge badge-info gap-2">
                <i className="fa-duotone fa-regular fa-hourglass-half"></i> Pending
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
            await client.patch(`/recruiter-candidates/${invitationId}`, {
                resend_invitation: true
            });

            await refresh();
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
            await client.patch(`/recruiter-candidates/${invitation.id}`, {
                cancel_invitation: true
            });

            await refresh();
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
            await refresh();
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
                <button
                    type="button"
                    className="btn btn-primary gap-2"
                    onClick={() => setShowInviteModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
                    Send Invitation
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                    <button className="btn btn-sm btn-ghost" onClick={refresh}>
                        <i className="fa-duotone fa-regular fa-rotate"></i>
                        Retry
                    </button>
                </div>
            )}

            <div className='card bg-base-200'>
                {/* Stats Cards */}
                <StatCardGrid className='m-2 shadow-lg'>
                    <StatCard
                        title="Total Invitations"
                        value={stats.total}
                        icon="fa-duotone fa-regular fa-envelopes"
                        description="Total candidate invitations"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        icon="fa-duotone fa-regular fa-hourglass-half"
                        color="info"
                        description="Awaiting response"
                    />
                    <StatCard
                        title="Accepted"
                        value={stats.accepted}
                        icon="fa-duotone fa-regular fa-check"
                        color="success"
                        description="Candidates joined"
                    />
                    <StatCard
                        title="Declined"
                        value={stats.declined}
                        icon="fa-duotone fa-regular fa-xmark"
                        color="error"
                        description="Not interested"
                    />
                </StatCardGrid>
                <div className='p-4 pt-0'></div>
            </div>
            {/* Loading State */}
            {loading && invitations.length === 0 && <LoadingState />}

            {/* Grid View */}
            {!loading && viewMode === 'grid' && invitations.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {invitations.map((invitation) => (
                        <div key={invitation.id} className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    {invitation.candidate?.full_name || 'Unknown'}
                                </h3>
                                <p className="text-sm text-base-content/70 mb-2">
                                    {invitation.candidate?.email || 'N/A'}
                                </p>
                                <div className="mb-2">
                                    <strong>Invited:</strong>{' '}
                                    {invitation.invited_at ? formatDate(invitation.invited_at) : 'N/A'}
                                </div>
                                <div className="mb-2">
                                    <strong>Expires:</strong>{' '}
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
                                </div>
                                <div className="mb-4">{getStatusBadge(invitation)}</div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => router.push(`/portal/candidates/${invitation.candidate_id}`)}
                                        title="View candidate"
                                    >
                                        <i className="fa-duotone fa-regular fa-eye"></i>
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
                                                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
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
                                                    <i className="fa-duotone fa-regular fa-trash"></i>
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
                                            <i className="fa-duotone fa-regular fa-comment"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            )}
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
                            <i className="fa-duotone fa-regular fa-search"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by candidate name or email..."
                            className="input w-full lg:w-80"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
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
                                        <td>{invitation.invited_at ? formatDate(invitation.invited_at) : 'N/A'}</td>
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
                                                    onClick={() => router.push(`/portal/candidates/${invitation.candidate_id}`)}
                                                    title="View candidate"
                                                >
                                                    <i className="fa-duotone fa-regular fa-eye"></i>
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
                                                                <i className="fa-duotone fa-regular fa-paper-plane"></i>
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
                                                                <i className="fa-duotone fa-regular fa-trash"></i>
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
                                                        <i className="fa-duotone fa-regular fa-comment"></i>
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
                        <i className="fa-duotone fa-regular fa-inbox text-6xl text-base-content/20 mb-4"></i>
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
                                    onClick={() => goToPage(1)}
                                    disabled={pagination.page === 1 || loading}
                                >
                                    <i className="fa-duotone fa-regular fa-angles-left"></i>
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => goToPage(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                >
                                    <i className="fa-duotone fa-regular fa-angle-left"></i>
                                </button>
                                <button className="join-item btn btn-sm btn-disabled">
                                    {pagination.page}
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => goToPage(pagination.page + 1)}
                                    disabled={pagination.page === pagination.total_pages || loading}
                                >
                                    <i className="fa-duotone fa-regular fa-angle-right"></i>
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => goToPage(pagination.total_pages)}
                                    disabled={pagination.page === pagination.total_pages || loading}
                                >
                                    <i className="fa-duotone fa-regular fa-angles-right"></i>
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
                                <i className="fa-duotone fa-regular fa-times"></i>
                            </button>
                        </div>

                        <fieldset className="fieldset mb-4">
                            <legend className="fieldset-legend">Candidate Email *</legend>
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
                            <p className="fieldset-label">
                                Enter the email address of the candidate you want to invite
                            </p>
                        </fieldset>

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
                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
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
