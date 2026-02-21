"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ModalPortal } from "@splits-network/shared-ui";
import { BaselConfirmModal, SpeedDial, type SpeedDialAction } from "@splits-network/basel-ui";
import type { Invitation } from "../../types";
import { canResendInvitation } from "../../types";

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
    onRefresh?: () => void;
    className?: string;
}

export default function ActionsToolbar({
    invitation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();

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

            onRefresh?.();
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

            onRefresh?.();
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

    const layoutClass =
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    const isLoading = resending || cancelling;

    /* ── Icon-Only Variant (SpeedDial) ── */

    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (actions.resend) {
            speedDialActions.push({
                key: "resend",
                icon: "fa-duotone fa-regular fa-paper-plane",
                label: "Resend Invitation",
                variant: "btn-primary",
                disabled: isLoading,
                loading: resending,
                onClick: handleResend,
            });
        }
        if (actions.cancel) {
            speedDialActions.push({
                key: "cancel",
                icon: "fa-duotone fa-regular fa-trash",
                label: "Cancel Invitation",
                variant: "btn-ghost",
                disabled: isLoading,
                loading: cancelling,
                onClick: () => setConfirmDialog(true),
            });
        }
        if (actions.viewDeclineReason) {
            speedDialActions.push({
                key: "decline-reason",
                icon: "fa-duotone fa-regular fa-comment",
                label: "View Decline Reason",
                variant: "btn-ghost",
                onClick: handleViewDeclineReason,
            });
        }
        if (actions.viewCandidate) {
            speedDialActions.push({
                key: "view-candidate",
                icon: "fa-duotone fa-regular fa-user",
                label: "View Candidate",
                variant: "btn-primary",
                href: `/portal/candidates?candidateId=${invitation.candidate_id}`,
            });
        }

        return (
            <>
                <SpeedDial
                    actions={speedDialActions}
                    size={size ?? "sm"}
                    className={className}
                />
                <ModalPortal>
                    {confirmDialog && (
                        <BaselConfirmModal
                            isOpen={confirmDialog}
                            onClose={() => setConfirmDialog(false)}
                            onConfirm={handleConfirmCancel}
                            title="Cancel Invitation"
                            confirmLabel="Cancel Invitation"
                            cancelLabel="Keep Invitation"
                            confirmColor="btn-error"
                        >
                            <p className="text-sm text-base-content/70">
                                Are you sure you want to cancel the invitation for{" "}
                                <span className="font-bold">
                                    {invitation.candidate?.full_name || "this candidate"}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </BaselConfirmModal>
                    )}
                </ModalPortal>
            </>
        );
    }

    /* ── Descriptive Variant ── */

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${layout === "horizontal" ? "gap-2" : "flex-col gap-2"} ${className}`}
            >
                {actions.resend && (
                    <button
                        onClick={handleResend}
                        className={`btn btn-${size} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        disabled={isLoading}
                    >
                        {resending ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                        )}
                        Resend
                    </button>
                )}
                {actions.cancel && (
                    <button
                        onClick={() => setConfirmDialog(true)}
                        className={`btn btn-${size} btn-ghost gap-2 text-error`}
                        style={{ borderRadius: 0 }}
                        disabled={isLoading}
                    >
                        {cancelling ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-trash" />
                        )}
                        Cancel
                    </button>
                )}
                {actions.viewDeclineReason && (
                    <button
                        onClick={handleViewDeclineReason}
                        className={`btn btn-${size} btn-ghost gap-2`}
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-comment" />
                        Decline Reason
                    </button>
                )}
                {actions.viewCandidate && (
                    <>
                        {(actions.resend ||
                            actions.cancel ||
                            actions.viewDeclineReason) && (
                            <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                        )}
                        <a
                            href={`/portal/candidates?candidateId=${invitation.candidate_id}`}
                            className={`btn btn-${size} btn-ghost gap-2`}
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-user" />
                            View Candidate
                        </a>
                    </>
                )}
            </div>

            <ModalPortal>
                {confirmDialog && (
                    <BaselConfirmModal
                        isOpen={confirmDialog}
                        onClose={() => setConfirmDialog(false)}
                        onConfirm={handleConfirmCancel}
                        title="Cancel Invitation"
                        confirmLabel="Cancel Invitation"
                        cancelLabel="Keep Invitation"
                        confirmColor="btn-error"
                    >
                        <p className="text-sm text-base-content/70">
                            Are you sure you want to cancel the invitation for{" "}
                            <span className="font-bold">
                                {invitation.candidate?.full_name || "this candidate"}
                            </span>
                            ? This action cannot be undone.
                        </p>
                    </BaselConfirmModal>
                )}
            </ModalPortal>
        </>
    );
}
