"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import ConfirmDialog from "@/components/confirm-dialog";
import { Invitation, canResendInvitation } from "../../types";
import { useFilter } from "../../contexts/filter-context";

export interface ActionsToolbarProps {
    invitation: Invitation;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewCandidate?: boolean;
        resend?: boolean;
        cancel?: boolean;
        viewDeclineReason?: boolean;
    };
    className?: string;
}

export default function ActionsToolbar({
    invitation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { refresh } = useFilter();

    const [resending, setResending] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);

    const canResend = canResendInvitation(invitation);

    const actions = {
        viewCandidate: showActions.viewCandidate !== false,
        resend: showActions.resend !== false && canResend,
        cancel: showActions.cancel !== false && canResend,
        viewDeclineReason:
            showActions.viewDeclineReason !== false &&
            !!invitation.declined_reason,
    };

    const handleResend = async () => {
        try {
            setResending(true);
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-candidates/${invitation.id}`, {
                resend_invitation: true,
            });

            await refresh();
            toast.success("Invitation resent successfully");
        } catch (err: any) {
            console.error("Failed to resend invitation:", err);
            toast.error(
                err.response?.data?.error ||
                    err.message ||
                    "Failed to resend invitation",
            );
        } finally {
            setResending(false);
        }
    };

    const handleConfirmCancel = async () => {
        try {
            setCancelling(true);
            setConfirmDialog(false);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-candidates/${invitation.id}`, {
                cancel_invitation: true,
            });

            await refresh();
            toast.success("Invitation cancelled");
        } catch (err: any) {
            console.error("Failed to cancel invitation:", err);
            toast.error(
                err.response?.data?.error ||
                    err.message ||
                    "Failed to cancel invitation",
            );
        } finally {
            setCancelling(false);
        }
    };

    const handleViewDeclineReason = () => {
        toast.info(invitation.declined_reason || "No reason provided");
    };

    const sizeClass = `btn-${size}`;
    const layoutClass = layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    const isLoading = resending || cancelling;

    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${layoutClass} ${className}`}
                >
                    {/* Resend - CTA */}
                    {actions.resend && (
                        <button
                            onClick={handleResend}
                            className={`btn ${sizeClass} btn-square btn-primary`}
                            title="Resend Invitation"
                            disabled={isLoading}
                        >
                            {resending ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                            )}
                        </button>
                    )}

                    {/* Cancel */}
                    {actions.cancel && (
                        <button
                            onClick={() => setConfirmDialog(true)}
                            className={`btn ${sizeClass} btn-square btn-error`}
                            title="Cancel Invitation"
                            disabled={isLoading}
                        >
                            {cancelling ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-trash" />
                            )}
                        </button>
                    )}

                    {/* View Decline Reason */}
                    {actions.viewDeclineReason && (
                        <button
                            onClick={handleViewDeclineReason}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title="View Decline Reason"
                        >
                            <i className="fa-duotone fa-regular fa-comment" />
                        </button>
                    )}

                    {/* View Candidate - far right */}
                    {actions.viewCandidate && (
                        <>
                            {(actions.resend ||
                                actions.cancel ||
                                actions.viewDeclineReason) && (
                                <div className="w-px h-4 bg-base-300 mx-0.5" />
                            )}
                            <Link
                                href={`/portal/candidates?candidateId=${invitation.candidate_id}`}
                                className={`btn ${sizeClass} btn-square btn-primary`}
                                title="View Candidate"
                            >
                                <i className="fa-duotone fa-regular fa-user" />
                            </Link>
                        </>
                    )}
                </div>

                <ConfirmDialog
                    isOpen={confirmDialog}
                    title="Cancel Invitation"
                    message={`Are you sure you want to cancel the invitation for ${invitation.candidate?.full_name || "this candidate"}? This action cannot be undone.`}
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setConfirmDialog(false)}
                    confirmText="Cancel Invitation"
                    cancelText="Keep Invitation"
                    type="error"
                    loading={cancelling}
                />
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${layoutClass} ${className}`}>
                {/* Resend - CTA */}
                {actions.resend && (
                    <button
                        onClick={handleResend}
                        className={`btn ${sizeClass} btn-primary gap-2`}
                        disabled={isLoading}
                    >
                        {resending ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                        )}
                        Resend Invitation
                    </button>
                )}

                {/* Cancel */}
                {actions.cancel && (
                    <button
                        onClick={() => setConfirmDialog(true)}
                        className={`btn ${sizeClass} btn-error btn-outline gap-2`}
                        disabled={isLoading}
                    >
                        {cancelling ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-trash" />
                        )}
                        Cancel Invitation
                    </button>
                )}

                {/* View Decline Reason */}
                {actions.viewDeclineReason && (
                    <button
                        onClick={handleViewDeclineReason}
                        className={`btn ${sizeClass} btn-ghost gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-comment" />
                        View Decline Reason
                    </button>
                )}

                {/* View Candidate - far right */}
                {actions.viewCandidate && (
                    <>
                        {(actions.resend ||
                            actions.cancel ||
                            actions.viewDeclineReason) && (
                            <div className="divider divider-horizontal mx-0" />
                        )}
                        <Link
                            href={`/portal/candidates?candidateId=${invitation.candidate_id}`}
                            className={`btn ${sizeClass} btn-outline gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-user" />
                            View Candidate
                        </Link>
                    </>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDialog}
                title="Cancel Invitation"
                message={`Are you sure you want to cancel the invitation for ${invitation.candidate?.full_name || "this candidate"}? This action cannot be undone.`}
                onConfirm={handleConfirmCancel}
                onCancel={() => setConfirmDialog(false)}
                confirmText="Cancel Invitation"
                cancelText="Keep Invitation"
                type="error"
                loading={cancelling}
            />
        </>
    );
}
