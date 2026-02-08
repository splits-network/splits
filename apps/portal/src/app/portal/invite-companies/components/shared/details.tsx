"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { LoadingState } from "@splits-network/shared-ui";
import {
    CompanyInvitation,
    getStatusBadgeClass,
    formatInvitationDate,
    getDaysUntilExpiry,
    getInviteLink,
} from "../../types";

interface DetailsProps {
    invitationId: string;
    onRefresh?: () => void;
}

export default function Details({ invitationId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [invitation, setInvitation] = useState<CompanyInvitation | null>(
        null,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!invitationId) return;
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/company-invitations/${invitationId}`,
            );
            setInvitation(response.data);
        } catch (err: any) {
            console.error("Failed to fetch invitation:", err);
            setError("Failed to load invitation details.");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitationId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleRefresh = useCallback(() => {
        fetchDetail();
        onRefresh?.();
    }, [fetchDetail, onRefresh]);

    const handleCopyCode = async () => {
        if (!invitation) return;
        try {
            await navigator.clipboard.writeText(invitation.invite_code);
            toast.success("Invite code copied to clipboard");
        } catch {
            toast.error("Failed to copy code");
        }
    };

    const handleCopyLink = async () => {
        if (!invitation) return;
        const link = getInviteLink(invitation);
        try {
            await navigator.clipboard.writeText(link);
            toast.success("Invite link copied to clipboard");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading invitation details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!invitation) return null;

    const daysUntilExpiry = getDaysUntilExpiry(invitation.expires_at);
    const isExpiringSoon =
        daysUntilExpiry <= 7 &&
        daysUntilExpiry > 0 &&
        invitation.status === "pending";

    return (
        <div className="space-y-6 p-6">
            {/* Invite Code Section */}
            <div className="bg-base-200 rounded-lg p-4">
                <label className="text-xs uppercase tracking-wider text-base-content/60 font-semibold mb-2 block">
                    Invite Code
                </label>
                <div className="flex items-center gap-2">
                    <code className="text-2xl font-mono font-bold tracking-wider flex-1">
                        {invitation.invite_code}
                    </code>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleCopyCode}
                        title="Copy code"
                    >
                        <i className="fa-duotone fa-regular fa-copy" />
                    </button>
                </div>
            </div>

            {/* Invite Link Section */}
            <div className="bg-base-200 rounded-lg p-4">
                <label className="text-xs uppercase tracking-wider text-base-content/60 font-semibold mb-2 block">
                    Invite Link
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="input input-sm flex-1 font-mono text-xs"
                        value={getInviteLink(invitation)}
                        readOnly
                    />
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleCopyLink}
                        title="Copy link"
                    >
                        <i className="fa-duotone fa-regular fa-link" />
                    </button>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">Status</span>
                    <span
                        className={`badge ${getStatusBadgeClass(invitation.status)}`}
                    >
                        {invitation.status}
                    </span>
                </div>

                {/* Company Name */}
                {invitation.company_name_hint && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">
                            Company
                        </span>
                        <span className="text-sm font-medium">
                            {invitation.company_name_hint}
                        </span>
                    </div>
                )}

                {/* Email */}
                {invitation.invited_email && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">
                            Email
                        </span>
                        <span className="text-sm font-medium">
                            {invitation.invited_email}
                        </span>
                    </div>
                )}

                {/* Created */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">
                        Created
                    </span>
                    <span className="text-sm">
                        {formatInvitationDate(invitation.created_at)}
                    </span>
                </div>

                {/* Expires */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">
                        Expires
                    </span>
                    <span
                        className={`text-sm ${isExpiringSoon ? "text-warning font-medium" : ""}`}
                    >
                        {formatInvitationDate(invitation.expires_at)}
                        {isExpiringSoon && ` (${daysUntilExpiry}d left)`}
                    </span>
                </div>

                {/* Accepted */}
                {invitation.accepted_at && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">
                            Accepted
                        </span>
                        <span className="text-sm">
                            {formatInvitationDate(invitation.accepted_at)}
                        </span>
                    </div>
                )}

                {/* Email Sent */}
                {invitation.email_sent_at && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">
                            Email Sent
                        </span>
                        <span className="text-sm text-success">
                            <i className="fa-duotone fa-regular fa-circle-check mr-1" />
                            {formatInvitationDate(invitation.email_sent_at)}
                        </span>
                    </div>
                )}
            </div>

            {/* Personal Message */}
            {invitation.personal_message && (
                <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-message text-primary" />
                        Personal Message
                    </h3>
                    <div className="bg-base-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
                        {invitation.personal_message}
                    </div>
                </div>
            )}
        </div>
    );
}
