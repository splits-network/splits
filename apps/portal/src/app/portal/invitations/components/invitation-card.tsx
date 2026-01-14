'use client';

import { useRouter } from 'next/navigation';
import { DataRow, DataList, MetricCard } from '@/components/ui/cards';
import { formatDate } from '@/lib/utils';
import type { RecruiterCandidateWithCandidate } from '@splits-network/shared-types';

// Re-export for backward compatibility
export type { RecruiterCandidateWithCandidate as RecruiterCandidate };

// ===== INVITATION CARD COMPONENT =====

interface InvitationCardProps {
    invitation: RecruiterCandidateWithCandidate;
    onResend: (id: string) => void;
    onCancel: (invitation: RecruiterCandidateWithCandidate) => void;
    onViewDeclineReason: (reason: string) => void;
    resendingId: string | null;
    cancellingId: string | null;
}

export function InvitationCard({
    invitation,
    onResend,
    onCancel,
    onViewDeclineReason,
    resendingId,
    cancellingId
}: InvitationCardProps) {
    const router = useRouter();

    const getStatusBadge = () => {
        if (invitation.status === 'active') {
            return (
                <span className="badge badge-success badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-check"></i> Active
                </span>
            );
        }
        if (invitation.status === 'expired') {
            return (
                <span className="badge badge-warning badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-clock"></i> Expired
                </span>
            );
        }
        if (invitation.status === 'terminated') {
            return (
                <span className="badge badge-neutral badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-ban"></i> Terminated
                </span>
            );
        }
        if (invitation.status === 'pending') {
            return (
                <span className="badge badge-info badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-hourglass-half"></i> Pending
                </span>
            );
        }
        if (invitation.status === 'accepted') {
            return (
                <span className="badge badge-success badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-check"></i> Accepted
                </span>
            );
        }
        if (invitation.status === 'declined') {
            return (
                <span className="badge badge-error badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-times"></i> Declined
                </span>
            );
        }
        if (invitation.status === 'cancelled') {
            return (
                <span className="badge badge-neutral badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-ban"></i> Cancelled
                </span>
            );
        }

        const isExpired = invitation.invitation_expires_at &&
            new Date(invitation.invitation_expires_at) < new Date();

        if (isExpired) {
            return (
                <span className="badge badge-warning badge-sm gap-1.5">
                    <i className="fa-duotone fa-regular fa-clock"></i> Expired
                </span>
            );
        }

        return (
            <span className="badge badge-info badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-hourglass-half"></i> Pending
            </span>
        );
    };

    const isExpired = invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();
    if (isExpired) invitation.status = 'expired';


    function canResendInvitation(): boolean {
        const resendState = invitation.status === 'terminated' || invitation.status === 'cancelled' || invitation.status === 'declined' || invitation.status === 'accepted';
        return !invitation.consent_given && !invitation.declined_at && !resendState;
    }

    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                {(invitation.candidate?.full_name || 'U')[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                {invitation.candidate?.full_name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-base-content/60 truncate">
                                {invitation.candidate?.email || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        {/* Status Badge */}
                        {getStatusBadge()}
                    </div>
                </div>
            </MetricCard.Header>

            <MetricCard.Body>
                {/* Data Rows */}
                <DataList compact>
                    <DataRow
                        icon="fa-paper-plane"
                        label="Invited"
                        value={invitation.invited_at ? formatDate(invitation.invited_at) : 'N/A'}
                    />
                    <DataRow
                        icon="fa-clock"
                        label="Expires"
                        value={invitation.invitation_expires_at ? formatDate(invitation.invitation_expires_at) : 'N/A'}
                    />
                    {invitation.consent_given_at && (
                        <DataRow
                            icon="fa-check"
                            label="Accepted"
                            value={formatDate(invitation.consent_given_at)}
                        />
                    )}
                    {invitation.declined_at && (
                        <DataRow
                            icon="fa-xmark"
                            label="Declined"
                            value={formatDate(invitation.declined_at)}
                        />
                    )}
                    {invitation.candidate?.phone && (
                        <DataRow
                            icon="fa-phone"
                            label="Phone"
                            value={invitation.candidate.phone}
                        />
                    )}
                </DataList>
            </MetricCard.Body>

            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full gap-2">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={() => router.push(`/portal/candidates/${invitation.candidate_id}`)}
                        title="View candidate"
                    >
                        <i className="fa-duotone fa-regular fa-eye"></i>
                        View Profile
                    </button>
                    <div className="flex items-center gap-2">
                        {canResendInvitation() && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => onResend(invitation.id)}
                                    disabled={resendingId === invitation.id || cancellingId === invitation.id}
                                    title="Resend invitation"
                                >
                                    {resendingId === invitation.id ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                            Resend
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-error btn-outline btn-sm"
                                    onClick={() => onCancel(invitation)}
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
                                className="btn btn-ghost btn-sm"
                                onClick={() => onViewDeclineReason(invitation.declined_reason || 'No reason provided')}
                                title="View decline reason"
                            >
                                <i className="fa-duotone fa-regular fa-comment"></i>
                            </button>
                        )}
                    </div>
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
