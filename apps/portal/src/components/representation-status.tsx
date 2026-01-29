"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

interface RepresentationStatusProps {
    invitation: RecruiterCandidateWithCandidate | null;
    loading?: boolean;
    onUpdate?: () => void;
    compact?: boolean; // For different layouts
    className?: string;
    // External action handlers (optional - overrides internal handlers)
    onResend?: (id: string) => void;
    onCancel?: (invitation: RecruiterCandidateWithCandidate) => void;
    // External loading states (optional - overrides internal loading)
    resendingId?: string | null;
    cancellingId?: string | null;
}

export function RepresentationStatus({
    invitation,
    loading = false,
    onUpdate,
    compact = false,
    className = "",
    onResend: externalOnResend,
    onCancel: externalOnCancel,
    resendingId,
    cancellingId,
}: RepresentationStatusProps) {
    const { getToken } = useAuth();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (action: "resend" | "revoke") => {
        if (!invitation) return;

        // Use external handlers if provided
        if (action === "resend" && externalOnResend) {
            externalOnResend(invitation.id);
            return;
        }
        if (action === "revoke" && externalOnCancel) {
            externalOnCancel(invitation);
            return;
        }

        // Fallback to internal handlers
        setActionLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            if (action === "resend") {
                await client.patch(`/recruiter-candidates/${invitation.id}`, {
                    resend_invitation: true,
                });
            } else {
                // revoke
                await client.patch(`/recruiter-candidates/${invitation.id}`, {
                    cancel_invitation: true,
                });
            }

            // Call the update callback to refresh data
            onUpdate?.();
        } catch (err: any) {
            console.error(err);
            setError(`Failed to ${action} invitation`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className={`skeleton h-24 w-full ${className}`}></div>;
    }

    // Only show if there is an invitation
    if (!invitation) return null;

    // Status logic - matches the enhanced logic from invitations browse
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

    // Determine display status and color
    let statusBadge: React.ReactElement;
    if (isAccepted) {
        statusBadge = (
            <span className="badge badge-success text-white">Representing</span>
        );
    } else if (isDeclined) {
        statusBadge = (
            <span className="badge badge-error text-white">Declined</span>
        );
    } else if (isRevoked) {
        statusBadge = <span className="badge badge-neutral">Revoked</span>;
    } else if (isExpired) {
        statusBadge = (
            <span className="badge badge-warning text-white">Expired</span>
        );
    } else if (isPending) {
        statusBadge = (
            <span className="badge badge-info text-white">Invited</span>
        );
    } else {
        statusBadge = <span className="badge badge-ghost">Unknown</span>;
    }

    const canResend = (isPending || isExpired) && !isRevoked;
    const canCancel = isPending && !isRevoked;

    return (
        <div
            className={`card bg-base-100 shadow-sm border border-base-200 ${className}`}
        >
            <div className="card-body p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="card-title text-sm font-semibold text-base-content/70 mb-1">
                            Representation Status
                        </h3>
                        <div className="flex gap-2 items-center mb-2">
                            {statusBadge}
                            {isPending &&
                                !isExpired &&
                                invitation.invitation_expires_at && (
                                    <span className="text-xs text-base-content/50">
                                        Expires{" "}
                                        {new Date(
                                            invitation.invitation_expires_at,
                                        ).toLocaleDateString()}
                                    </span>
                                )}
                        </div>
                        {isDeclined && invitation.declined_reason && (
                            <p className="text-xs text-error mt-2">
                                Reason: {invitation.declined_reason}
                            </p>
                        )}
                        {error && (
                            <p className="text-xs text-error mt-2">{error}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                        {canResend && (
                            <div className="flex gap-2">
                                <button
                                    className={`btn btn-sm btn-outline ${compact ? "btn-xs" : ""}`}
                                    onClick={() => handleAction("resend")}
                                    disabled={
                                        resendingId === invitation.id ||
                                        actionLoading
                                    }
                                >
                                    {resendingId === invitation.id ||
                                    (actionLoading && !resendingId) ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            {compact ? "" : "Resending..."}
                                        </>
                                    ) : (
                                        "Resend"
                                    )}
                                </button>
                                {canCancel && (
                                    <button
                                        className={`btn btn-sm btn-outline btn-error ${compact ? "btn-xs" : ""}`}
                                        onClick={() => handleAction("revoke")}
                                        disabled={
                                            cancellingId === invitation.id ||
                                            actionLoading
                                        }
                                    >
                                        {cancellingId === invitation.id ||
                                        (actionLoading && !cancellingId) ? (
                                            <>
                                                <span className="loading loading-spinner loading-xs"></span>
                                                {compact ? "" : "Revoking..."}
                                            </>
                                        ) : (
                                            "Revoke"
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
