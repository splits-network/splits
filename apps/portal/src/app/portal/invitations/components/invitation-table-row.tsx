"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import type { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

// ===== TYPES =====

interface InvitationTableRowProps {
    invitation: RecruiterCandidateWithCandidate;
    onResend: (id: string) => void;
    onCancel: (invitation: RecruiterCandidateWithCandidate) => void;
    onViewDeclineReason: (reason: string) => void;
    resendingId: string | null;
    cancellingId: string | null;
}

// ===== HELPER FUNCTIONS =====

function getStatusBadge(invitation: RecruiterCandidateWithCandidate) {
    if (invitation.status === "active") {
        return (
            <span className="badge badge-success badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-check"></i> Active
            </span>
        );
    }
    if (invitation.status === "expired") {
        return (
            <span className="badge badge-warning badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-clock"></i> Expired
            </span>
        );
    }
    if (invitation.status === "terminated") {
        return (
            <span className="badge badge-neutral badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-ban"></i> Terminated
            </span>
        );
    }
    if (invitation.status === "pending") {
        return (
            <span className="badge badge-info badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-hourglass-half"></i>{" "}
                Pending
            </span>
        );
    }
    if (invitation.status === "accepted") {
        return (
            <span className="badge badge-success badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-check"></i> Accepted
            </span>
        );
    }
    if (invitation.status === "declined") {
        return (
            <span className="badge badge-error badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-times"></i> Declined
            </span>
        );
    }
    if (invitation.status === "cancelled") {
        return (
            <span className="badge badge-neutral badge-sm gap-1.5">
                <i className="fa-duotone fa-regular fa-ban"></i> Cancelled
            </span>
        );
    }

    const isExpired =
        invitation.invitation_expires_at &&
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
}

function canResendInvitation(
    invitation: RecruiterCandidateWithCandidate,
): boolean {
    const resendState =
        invitation.status === "terminated" ||
        invitation.status === "cancelled" ||
        invitation.status === "declined" ||
        invitation.status === "accepted";
    return !invitation.consent_given && !invitation.declined_at && !resendState;
}

// ===== COMPONENT =====

export function InvitationTableRow({
    invitation,
    onResend,
    onCancel,
    onViewDeclineReason,
    resendingId,
    cancellingId,
}: InvitationTableRowProps) {
    const router = useRouter();

    // Main row cells
    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    {/* Candidate Avatar */}
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {invitation.candidate?.profile_picture ? (
                                <img
                                    src={invitation.candidate.profile_picture}
                                    alt={invitation.candidate.full_name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                (invitation.candidate?.full_name ||
                                    "C")[0].toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold"
                            title={invitation.candidate?.full_name}
                        >
                            {invitation.candidate?.full_name}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {invitation.candidate?.email}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {formatDate(invitation.invited_at)}
                </span>
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {invitation.invitation_expires_at
                        ? formatDate(invitation.invitation_expires_at)
                        : "N/A"}
                </span>
            </td>
            <td>{getStatusBadge(invitation)}</td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() =>
                            router.push(
                                `/portal/candidates/${invitation.candidate_id}`,
                            )
                        }
                        title="View candidate profile"
                    >
                        <i className="fa-duotone fa-regular fa-eye fa-fw"></i>
                    </button>
                    {canResendInvitation(invitation) && (
                        <>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm btn-square"
                                onClick={() => onResend(invitation.id)}
                                disabled={
                                    resendingId === invitation.id ||
                                    cancellingId === invitation.id
                                }
                                title="Resend invitation"
                            >
                                {resendingId === invitation.id ? (
                                    <i className="fa-duotone fa-regular fa-spinner-third fa-spin fa-fw"></i>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-paper-plane fa-fw"></i>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-error btn-sm btn-square"
                                onClick={() => onCancel(invitation)}
                                disabled={
                                    resendingId === invitation.id ||
                                    cancellingId === invitation.id
                                }
                                title="Cancel invitation"
                            >
                                {cancellingId === invitation.id ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-trash fa-fw"></i>
                                )}
                            </button>
                        </>
                    )}
                    {invitation.declined_reason && (
                        <button
                            type="button"
                            className="btn btn-sm btn-square"
                            onClick={() =>
                                onViewDeclineReason(
                                    invitation.declined_reason ||
                                        "No reason provided",
                                )
                            }
                            title="View decline reason"
                        >
                            <i className="fa-duotone fa-regular fa-comment"></i>
                        </button>
                    )}
                </div>
            </td>
        </>
    );

    // Expanded content
    const expandedContent = (
        <div className="space-y-4">
            {/* Status Details */}
            <ExpandedDetailSection title="Invitation Details">
                <div className="space-y-2">
                    {invitation.status === "pending" &&
                        invitation.invitation_expires_at && (
                            <div className="text-sm">
                                {new Date(invitation.invitation_expires_at) <
                                new Date() ? (
                                    <span className="text-error">
                                        <i className="fa-duotone fa-regular fa-clock mr-2"></i>
                                        Invitation expired on{" "}
                                        {formatDate(
                                            invitation.invitation_expires_at,
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-warning">
                                        <i className="fa-duotone fa-regular fa-clock mr-2"></i>
                                        Expires on{" "}
                                        {formatDate(
                                            invitation.invitation_expires_at,
                                        )}
                                    </span>
                                )}
                            </div>
                        )}
                    {invitation.declined_reason && (
                        <div className="alert alert-error alert-sm">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <div>
                                <div className="font-semibold">
                                    Decline Reason:
                                </div>
                                <div>{invitation.declined_reason}</div>
                            </div>
                        </div>
                    )}
                </div>
            </ExpandedDetailSection>

            {/* Details Grid */}
            <ExpandedDetailGrid cols={2}>
                <ExpandedDetailItem
                    icon="fa-user"
                    label="Candidate"
                    value={invitation.candidate?.full_name}
                />
                <ExpandedDetailItem
                    icon="fa-envelope"
                    label="Email"
                    value={invitation.candidate?.email}
                />
            </ExpandedDetailGrid>

            {/* Second Row - Additional Info */}
            <ExpandedDetailGrid cols={3}>
                <ExpandedDetailItem
                    icon="fa-location-dot"
                    label="Location"
                    value={invitation.candidate?.location || "Not specified"}
                />
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Current Company"
                    value={
                        invitation.candidate?.current_company || "Not specified"
                    }
                />
                <ExpandedDetailItem
                    icon="fa-briefcase"
                    label="Current Role"
                    value={
                        invitation.candidate?.current_title || "Not specified"
                    }
                />
            </ExpandedDetailGrid>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300 justify-between">
                <button
                    type="button"
                    className="btn btn-primary btn-sm gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                            `/portal/candidates/${invitation.candidate_id}`,
                        );
                    }}
                >
                    <i className="fa-duotone fa-regular fa-eye"></i>
                    View Candidate
                </button>
                <div className="flex items-center gap-2">
                    {canResendInvitation(invitation) && (
                        <>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onResend(invitation.id);
                                }}
                                disabled={
                                    resendingId === invitation.id ||
                                    cancellingId === invitation.id
                                }
                            >
                                <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                Resend Invitation
                            </button>
                            <button
                                type="button"
                                className="btn btn-error btn-outline btn-sm gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel(invitation);
                                }}
                                disabled={
                                    resendingId === invitation.id ||
                                    cancellingId === invitation.id
                                }
                            >
                                <i className="fa-duotone fa-regular fa-trash"></i>
                                Cancel Invitation
                            </button>
                        </>
                    )}
                    {invitation.declined_reason && (
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDeclineReason(
                                    invitation.declined_reason ||
                                        "No reason provided",
                                );
                            }}
                        >
                            <i className="fa-duotone fa-regular fa-comment"></i>
                            View Decline Reason
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`invitation-${invitation.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
