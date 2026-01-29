"use client";

import React, { useCallback } from "react";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";
import { RepresentationStatus } from "@/components/representation-status";

interface InvitationsBrowseDetailProps {
    invitation: RecruiterCandidateWithCandidate | null;
    onResend: (id: string) => void;
    onCancel: (invitation: RecruiterCandidateWithCandidate) => void;
    onViewDeclineReason: (reason: string) => void;
    onClose: () => void;
    resendingId: string | null;
    cancellingId: string | null;
}

export function InvitationsBrowseDetail({
    invitation,
    onResend,
    onCancel,
    onViewDeclineReason,
    onClose,
    resendingId,
    cancellingId,
}: InvitationsBrowseDetailProps) {
    const handleUpdate = useCallback(() => {
        // Trigger parent to refresh data - this could be enhanced to pass a refresh callback
        // For now, the parent should handle data refreshing through its own mechanisms
    }, []);

    if (!invitation) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-base-content/40">
                <div className="bg-base-200 p-6 rounded-full mb-4">
                    <i className="fa-duotone fa-regular fa-user-magnifying-glass text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    Select a inivitation
                </h3>
                <p className="max-w-xs">
                    Select a invitation from the list to view the details and
                    manage representation.
                </p>
            </div>
        );
    }

    const candidate = invitation.candidate;
    const formatDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) return "Unknown";
        const date =
            dateString instanceof Date ? dateString : new Date(dateString);
        return date.toLocaleDateString();
    };

    // Enhanced status logic for the header badge (still needed for header display)
    const isPending =
        !invitation.consent_given &&
        !invitation.declined_at &&
        invitation.status !== "terminated";
    const isAccepted = invitation.consent_given;
    const isDeclined = !!invitation.declined_at;
    const isRevoked = invitation.status === "terminated";
    const isExpired =
        isPending &&
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    // Determine display status and color for header badge
    let displayStatus = "Unknown";
    let statusColor = "badge-ghost";

    if (isAccepted) {
        displayStatus = "Representing";
        statusColor = "badge-success";
    } else if (isDeclined) {
        displayStatus = "Declined";
        statusColor = "badge-error";
    } else if (isRevoked) {
        displayStatus = "Revoked";
        statusColor = "badge-neutral";
    } else if (isExpired) {
        displayStatus = "Expired";
        statusColor = "badge-warning";
    } else if (isPending) {
        displayStatus = "Invited";
        statusColor = "badge-info";
    }

    return (
        <div className="h-full flex flex-col">
            {/* Mobile Header with Back Button */}
            <div className="flex md:hidden items-center p-4 border-b border-base-300 bg-base-100">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm mr-3"
                    aria-label="Back to list"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                </button>
                <h3 className="text-lg font-semibold flex-1">
                    Invitation Details
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold">
                                {candidate?.full_name || "Unknown Candidate"}
                            </h3>
                            <p className="text-base-content/60 mt-1">
                                {candidate?.email || "No email"}
                            </p>
                        </div>
                        <div className={`badge ${statusColor} badge-lg`}>
                            {displayStatus}
                        </div>
                    </div>

                    {/* Representation Status */}
                    <RepresentationStatus
                        invitation={invitation}
                        onResend={onResend}
                        onCancel={onCancel}
                        resendingId={resendingId}
                        cancellingId={cancellingId}
                        onUpdate={handleUpdate}
                    />

                    {/* Invitation Details */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                                Invitation Details
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Invited Date
                                    </div>
                                    <div>
                                        {formatDate(invitation.invited_at)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Expires Date
                                    </div>
                                    <div>
                                        {formatDate(
                                            invitation.invitation_expires_at,
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Declined Date
                                    </div>
                                    <div>
                                        {formatDate(invitation.declined_at)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Status
                                    </div>
                                    <div className={`badge ${statusColor}`}>
                                        {displayStatus}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Information */}
                    {candidate && (
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="card-title text-lg">
                                    <i className="fa-duotone fa-regular fa-user mr-2"></i>
                                    Candidate Information
                                </h4>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium text-base-content/70">
                                            Full Name
                                        </div>
                                        <div>{candidate.full_name}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-base-content/70">
                                            Email
                                        </div>
                                        <div>{candidate.email}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-base-content/70">
                                            Phone
                                        </div>
                                        <div>
                                            {candidate.phone || "Not provided"}
                                        </div>
                                    </div>

                                    {candidate.location && (
                                        <div>
                                            <div className="text-sm font-medium text-base-content/70">
                                                Location
                                            </div>
                                            <div>{candidate.location}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Decline Reason */}
                    {isDeclined && invitation.declined_reason && (
                        <div className="card bg-error/10 border border-error/20">
                            <div className="card-body">
                                <h4 className="card-title text-lg text-error">
                                    <i className="fa-duotone fa-regular fa-times-circle mr-2"></i>
                                    Decline Reason
                                </h4>
                                <p className="text-error/80">
                                    {invitation.declined_reason}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
