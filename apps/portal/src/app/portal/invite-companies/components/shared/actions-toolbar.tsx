"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { CompanyInvitation, getInviteLink } from "../../types";

export interface InvitationActionsToolbarProps {
    invitation: CompanyInvitation;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        copyCode?: boolean;
        copyLink?: boolean;
        share?: boolean;
        resend?: boolean;
        revoke?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (id: string) => void;
    className?: string;
}

export default function InvitationActionsToolbar({
    invitation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    onViewDetails,
    className = "",
}: InvitationActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [resending, setResending] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const isPending = invitation.status === "pending";
    const hasEmail = !!invitation.invited_email;

    const actions = {
        copyCode: showActions.copyCode !== false,
        copyLink: showActions.copyLink !== false,
        share: showActions.share !== false,
        resend: showActions.resend !== false && isPending && hasEmail,
        revoke: showActions.revoke !== false && isPending,
    };

    const handleCopyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(invitation.invite_code);
            toast.success("Invite code copied to clipboard");
        } catch {
            toast.error("Failed to copy code");
        }
    }, [invitation.invite_code, toast]);

    const handleCopyLink = useCallback(async () => {
        const link = getInviteLink(invitation);
        try {
            await navigator.clipboard.writeText(link);
            toast.success("Invite link copied to clipboard");
        } catch {
            toast.error("Failed to copy link");
        }
    }, [invitation, toast]);

    const handleShare = useCallback(async () => {
        const link = getInviteLink(invitation);
        const shareData = {
            title: "Join Splits Network",
            text: `You've been invited to join Splits Network! Use code ${invitation.invite_code} or click the link to get started.`,
            url: link,
        };

        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled share
            }
        } else {
            const message = `${shareData.text}\n\n${link}`;
            try {
                await navigator.clipboard.writeText(message);
                toast.success("Invitation message copied to clipboard");
            } catch {
                toast.error("Failed to copy message");
            }
        }
    }, [invitation, toast]);

    const handleResend = useCallback(async () => {
        setResending(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/company-invitations/${invitation.id}/resend`);
            toast.success("Invitation email resent");
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to resend invitation",
            );
        } finally {
            setResending(false);
        }
    }, [invitation.id, getToken, toast]);

    const handleRevoke = useCallback(async () => {
        if (!confirm("Are you sure you want to revoke this invitation?")) {
            return;
        }
        setRevoking(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(`/company-invitations/${invitation.id}/revoke`);
            toast.success("Invitation revoked");
            onRefresh?.();
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to revoke invitation",
            );
        } finally {
            setRevoking(false);
        }
    }, [invitation.id, getToken, toast, onRefresh]);

    const handleViewDetails = useCallback(() => {
        onViewDetails?.(invitation.id);
    }, [invitation.id, onViewDetails]);

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    if (variant === "icon-only") {
        return (
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {onViewDetails && (
                    <button
                        onClick={handleViewDetails}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="View Details"
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                    </button>
                )}
                {actions.copyCode && (
                    <button
                        onClick={handleCopyCode}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="Copy code"
                    >
                        <i className="fa-duotone fa-regular fa-copy" />
                    </button>
                )}
                {actions.copyLink && (
                    <button
                        onClick={handleCopyLink}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="Copy link"
                    >
                        <i className="fa-duotone fa-regular fa-link" />
                    </button>
                )}
                {actions.share && (
                    <button
                        onClick={handleShare}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="Share"
                    >
                        <i className="fa-duotone fa-regular fa-share" />
                    </button>
                )}
                {actions.resend && (
                    <button
                        onClick={handleResend}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        disabled={resending}
                        title="Resend email"
                    >
                        {resending ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-envelope" />
                        )}
                    </button>
                )}
                {actions.revoke && (
                    <button
                        onClick={handleRevoke}
                        className={`btn ${getSizeClass()} btn-square btn-ghost text-error`}
                        disabled={revoking}
                        title="Revoke"
                    >
                        {revoking ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-ban" />
                        )}
                    </button>
                )}
            </div>
        );
    }

    // Descriptive variant
    return (
        <div
            className={`flex ${layout === "horizontal" ? "flex-wrap gap-2" : "flex-col gap-2"} ${className}`}
        >
            {onViewDetails && (
                <button
                    onClick={handleViewDetails}
                    className={`btn ${getSizeClass()} btn-outline gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-eye" />
                    View Details
                </button>
            )}
            {actions.copyCode && (
                <button
                    onClick={handleCopyCode}
                    className={`btn ${getSizeClass()} btn-outline gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-copy" />
                    Copy Code
                </button>
            )}
            {actions.copyLink && (
                <button
                    onClick={handleCopyLink}
                    className={`btn ${getSizeClass()} btn-outline gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-link" />
                    Copy Link
                </button>
            )}
            {actions.share && (
                <button
                    onClick={handleShare}
                    className={`btn ${getSizeClass()} btn-primary gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-share" />
                    Share
                </button>
            )}
            {actions.resend && (
                <button
                    onClick={handleResend}
                    className={`btn ${getSizeClass()} btn-outline gap-2`}
                    disabled={resending}
                >
                    {resending ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-envelope" />
                    )}
                    Resend Email
                </button>
            )}
            {actions.revoke && (
                <button
                    onClick={handleRevoke}
                    className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
                    disabled={revoking}
                >
                    {revoking ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-ban" />
                    )}
                    Revoke
                </button>
            )}
        </div>
    );
}
