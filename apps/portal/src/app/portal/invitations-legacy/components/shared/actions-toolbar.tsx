"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Modal, Button } from "@splits-network/memphis-ui";
import type { Invitation } from "../../types";
import { canResendInvitation } from "../../types";
import { ExpandableButton } from "./expandable-button";

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

    // ===== ICON-ONLY VARIANT =====
    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${layoutClass} ${className}`}
                >
                    {actions.resend && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-paper-plane"
                            label="Resend"
                            variant="btn-primary"
                            size={size}
                            onClick={handleResend}
                            disabled={isLoading}
                            loading={resending}
                            title="Resend Invitation"
                        />
                    )}
                    {actions.cancel && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-trash"
                            label="Cancel"
                            variant="btn-ghost"
                            size={size}
                            onClick={() => setConfirmDialog(true)}
                            disabled={isLoading}
                            loading={cancelling}
                            title="Cancel Invitation"
                        />
                    )}
                    {actions.viewDeclineReason && (
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-comment"
                            label="Reason"
                            variant="btn-ghost"
                            size={size}
                            onClick={handleViewDeclineReason}
                            title="View Decline Reason"
                        />
                    )}
                    {actions.viewCandidate && (
                        <>
                            {(actions.resend ||
                                actions.cancel ||
                                actions.viewDeclineReason) && (
                                <div className="w-px h-4 bg-dark/20 mx-0.5" />
                            )}
                            <ExpandableButton
                                icon="fa-duotone fa-regular fa-user"
                                label="Candidate"
                                variant="btn-primary"
                                size={size}
                                href={`/portal/candidates?candidateId=${invitation.candidate_id}`}
                                title="View Candidate"
                            />
                        </>
                    )}
                </div>

                <Modal
                    open={confirmDialog}
                    onClose={() => setConfirmDialog(false)}
                    title="Cancel Invitation"
                    closeOnBackdrop
                >
                    <p className="text-sm text-dark/70 mb-6">
                        Are you sure you want to cancel the invitation for{" "}
                        <span className="font-bold text-dark">
                            {invitation.candidate?.full_name ||
                                "this candidate"}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            color="dark"
                            variant="ghost"
                            onClick={() => setConfirmDialog(false)}
                        >
                            Keep Invitation
                        </Button>
                        <Button color="coral" onClick={handleConfirmCancel}>
                            Cancel Invitation
                        </Button>
                    </div>
                </Modal>
            </>
        );
    }

    // ===== DESCRIPTIVE VARIANT =====
    return (
        <>
            <div
                className={`flex flex-wrap items-center ${layout === "horizontal" ? "gap-2" : "flex-col gap-2"} ${className}`}
            >
                {actions.resend && (
                    <button
                        onClick={handleResend}
                        className={`btn btn-${size} btn-primary gap-2`}
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
                        className={`btn btn-${size} btn-ghost gap-2 text-coral`}
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
                            <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                        )}
                        <a
                            href={`/portal/candidates?candidateId=${invitation.candidate_id}`}
                            className={`btn btn-${size} btn-ghost gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-user" />
                            View Candidate
                        </a>
                    </>
                )}
            </div>

            <Modal
                open={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                title="Cancel Invitation"
                closeOnBackdrop
            >
                <p className="text-sm text-dark/70 mb-6">
                    Are you sure you want to cancel the invitation for{" "}
                    <span className="font-bold text-dark">
                        {invitation.candidate?.full_name || "this candidate"}
                    </span>
                    ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button
                        color="dark"
                        variant="ghost"
                        onClick={() => setConfirmDialog(false)}
                    >
                        Keep Invitation
                    </Button>
                    <Button color="coral" onClick={handleConfirmCancel}>
                        Cancel Invitation
                    </Button>
                </div>
            </Modal>
        </>
    );
}
