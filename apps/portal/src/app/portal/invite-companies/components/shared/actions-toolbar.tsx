"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import type { CompanyInvitation } from "../../types";
import { getInviteLink } from "./helpers";
import { ExpandableButton } from "./expandable-button";

export interface InvitationActionsToolbarProps {
    invitation: CompanyInvitation;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md" | "lg";
    showActions?: {
        copyCode?: boolean;
        copyLink?: boolean;
        share?: boolean;
        resend?: boolean;
        revoke?: boolean;
    };
    onRefresh?: () => void;
    className?: string;
}

export default function InvitationActionsToolbar({
    invitation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    onRefresh,
    className = "",
}: InvitationActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const refresh = onRefresh ?? (() => {});

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.id, toast]);

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
            refresh();
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to revoke invitation",
            );
        } finally {
            setRevoking(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.id, toast, onRefresh]);

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    if (variant === "icon-only") {
        return (
            <div
                className={`flex items-center ${getLayoutClass()} ${className}`}
            >
                {actions.copyCode && (
                    <ExpandableButton
                        icon="fa-duotone fa-regular fa-copy"
                        label="Code"
                        variant="btn-ghost"
                        size={size}
                        onClick={handleCopyCode}
                        title="Copy invite code"
                    />
                )}
                {actions.copyLink && (
                    <ExpandableButton
                        icon="fa-duotone fa-regular fa-link"
                        label="Link"
                        variant="btn-ghost"
                        size={size}
                        onClick={handleCopyLink}
                        title="Copy invite link"
                    />
                )}
                {actions.share && (
                    <ExpandableButton
                        icon="fa-duotone fa-regular fa-share-nodes"
                        label="Share"
                        variant="btn-ghost"
                        size={size}
                        onClick={handleShare}
                        title="Share invitation"
                    />
                )}
                {actions.resend && (
                    <ExpandableButton
                        icon="fa-duotone fa-regular fa-envelope"
                        label="Resend"
                        variant="btn-secondary"
                        size={size}
                        onClick={handleResend}
                        disabled={resending}
                        loading={resending}
                        title="Resend email"
                    />
                )}
                {actions.revoke && (
                    <>
                        <div className="w-px h-4 bg-dark/20 mx-0.5" />
                        <ExpandableButton
                            icon="fa-duotone fa-regular fa-ban"
                            label="Revoke"
                            variant="btn-ghost"
                            size={size}
                            onClick={handleRevoke}
                            disabled={revoking}
                            loading={revoking}
                            title="Revoke invitation"
                        />
                    </>
                )}
            </div>
        );
    }

    // Descriptive variant
    return (
        <div
            className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
        >
            {actions.copyCode && (
                <button
                    onClick={handleCopyCode}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                    title="Copy invite code"
                >
                    <i className="fa-duotone fa-regular fa-copy" />
                    <span className="hidden md:inline">Copy Code</span>
                </button>
            )}
            {actions.copyLink && (
                <button
                    onClick={handleCopyLink}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                    title="Copy invite link"
                >
                    <i className="fa-duotone fa-regular fa-link" />
                    <span className="hidden md:inline">Copy Link</span>
                </button>
            )}
            {actions.share && (
                <button
                    onClick={handleShare}
                    className={`btn ${getSizeClass()} btn-primary gap-2`}
                    title="Share invitation"
                >
                    <i className="fa-duotone fa-regular fa-share-nodes" />
                    <span className="hidden md:inline">Share</span>
                </button>
            )}
            {actions.resend && (
                <button
                    onClick={handleResend}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                    disabled={resending}
                    title="Resend email"
                >
                    {resending ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-envelope" />
                    )}
                    <span className="hidden md:inline">Resend</span>
                </button>
            )}
            {actions.revoke && (
                <>
                    <div className="hidden sm:block w-px self-stretch bg-dark/20 mx-1" />
                    <button
                        onClick={handleRevoke}
                        className={`btn ${getSizeClass()} btn-ghost gap-2 text-coral`}
                        disabled={revoking}
                        title="Revoke invitation"
                    >
                        {revoking ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-ban" />
                        )}
                        <span className="hidden md:inline">Revoke</span>
                    </button>
                </>
            )}
        </div>
    );
}
