"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    EmptyState,
    LoadingState,
    PaginationControls,
    useStandardList,
} from "@/hooks/use-standard-list";
import { useToast } from "@/lib/toast-context";
import { CreateInvitationModal } from "./create-invitation-modal";
import { InvitationCard } from "./invitation-card";
import { DataTable, type TableColumn } from "@/components/ui";

interface CompanyInvitation {
    id: string;
    recruiter_id: string;
    invite_code: string;
    invite_link_token: string;
    invited_email?: string;
    company_name_hint?: string;
    personal_message?: string;
    status: "pending" | "accepted" | "expired" | "revoked";
    expires_at: string;
    accepted_at?: string;
    email_sent_at?: string;
    created_at: string;
    invite_url?: string;
    recruiter?: {
        id: string;
        user: {
            name: string;
            email: string;
        };
    };
}

interface InvitationFilters {
    status: string;
}

const invitationColumns: TableColumn[] = [
    { key: "company_name_hint", label: "Company", sortable: true },
    { key: "invited_email", label: "Email", sortable: true },
    { key: "invite_code", label: "Invite Code", sortable: false },
    { key: "status", label: "Status", sortable: true },
    { key: "created_at", label: "Created", sortable: true },
    { key: "expires_at", label: "Expires", sortable: true },
    { key: "actions", label: "Actions", align: "right" as const },
];

export function InviteCompaniesClient() {
    const { getToken } = useAuth();
    const toast = useToast();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const defaultFilters = useMemo<InvitationFilters>(
        () => ({
            status: "",
        }),
        []
    );

    const {
        data: invitations,
        pagination,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        clearFilters,
        page,
        setPage,
        refresh,
    } = useStandardList<CompanyInvitation, InvitationFilters>({
        endpoint: "/company-invitations",
        defaultFilters,
        pageSize: 10,
    });

    const handleCreateSuccess = useCallback(() => {
        refresh();
        setShowCreateModal(false);
    }, [refresh]);

    const handleCopyCode = useCallback(
        async (code: string) => {
            try {
                await navigator.clipboard.writeText(code);
                toast.success("Invite code copied to clipboard");
            } catch {
                toast.error("Failed to copy code");
            }
        },
        [toast]
    );

    const handleCopyLink = useCallback(
        async (invitation: CompanyInvitation) => {
            const link =
                invitation.invite_url ||
                `${window.location.origin}/join/${invitation.invite_link_token}`;
            try {
                await navigator.clipboard.writeText(link);
                toast.success("Invite link copied to clipboard");
            } catch {
                toast.error("Failed to copy link");
            }
        },
        [toast]
    );

    const handleShare = useCallback(
        async (invitation: CompanyInvitation) => {
            const link =
                invitation.invite_url ||
                `${window.location.origin}/join/${invitation.invite_link_token}`;
            const shareData = {
                title: "Join Splits Network",
                text: `You've been invited to join Splits Network! Use code ${invitation.invite_code} or click the link to get started.`,
                url: link,
            };

            if (navigator.share && navigator.canShare?.(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (e) {
                    // User cancelled share
                }
            } else {
                // Fallback to copying the message
                const message = `${shareData.text}\n\n${link}`;
                try {
                    await navigator.clipboard.writeText(message);
                    toast.success("Invitation message copied to clipboard");
                } catch {
                    toast.error("Failed to copy message");
                }
            }
        },
        [toast]
    );

    const handleResend = useCallback(
        async (id: string) => {
            setResendingId(id);
            try {
                const token = await getToken();
                const client = createAuthenticatedClient(token);
                await client.post(`/company-invitations/${id}/resend`);
                toast.success("Invitation email resent");
            } catch (e: any) {
                toast.error(
                    e?.response?.data?.error?.message || "Failed to resend invitation"
                );
            } finally {
                setResendingId(null);
            }
        },
        [getToken, toast]
    );

    const handleRevoke = useCallback(
        async (id: string) => {
            setRevokingId(id);
            try {
                const token = await getToken();
                const client = createAuthenticatedClient(token);
                await client.patch(`/company-invitations/${id}/revoke`);
                toast.success("Invitation revoked");
                refresh();
            } catch (e: any) {
                toast.error(
                    e?.response?.data?.error?.message || "Failed to revoke invitation"
                );
            } finally {
                setRevokingId(null);
            }
        },
        [getToken, toast, refresh]
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="badge badge-warning">Pending</span>;
            case "accepted":
                return <span className="badge badge-success">Accepted</span>;
            case "expired":
                return <span className="badge badge-ghost">Expired</span>;
            case "revoked":
                return <span className="badge badge-error">Revoked</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading && invitations.length === 0) {
        return <LoadingState message="Loading invitations..." />;
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>Failed to load invitations: {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-2 flex-wrap">
                    <select
                        className="select select-sm"
                        value={filters.status}
                        onChange={(e) => setFilter("status", e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="expired">Expired</option>
                        <option value="revoked">Revoked</option>
                    </select>
                    {filters.status && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus mr-2"></i>
                    Create Invitation
                </button>
            </div>

            {/* Invitations List */}
            {invitations.length === 0 ? (
                <EmptyState
                    title="No invitations yet"
                    message="Create your first invitation to start bringing companies to Splits Network"
                    action={{
                        label: "Create Invitation",
                        onClick: () => setShowCreateModal(true),
                    }}
                />
            ) : (
                <>
                    {/* Card view for mobile, table for desktop */}
                    <div className="hidden lg:block">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        {invitationColumns.map((col) => (
                                            <th
                                                key={col.key}
                                                className={
                                                    col.align === "right"
                                                        ? "text-right"
                                                        : ""
                                                }
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.map((invitation) => (
                                        <tr key={invitation.id}>
                                            <td>
                                                {invitation.company_name_hint || (
                                                    <span className="text-base-content/50">
                                                        Not specified
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {invitation.invited_email || (
                                                    <span className="text-base-content/50">
                                                        No email
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <code className="bg-base-200 px-2 py-1 rounded text-sm font-mono">
                                                    {invitation.invite_code}
                                                </code>
                                            </td>
                                            <td>{getStatusBadge(invitation.status)}</td>
                                            <td>{formatDate(invitation.created_at)}</td>
                                            <td>{formatDate(invitation.expires_at)}</td>
                                            <td className="text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <button
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() =>
                                                            handleCopyCode(invitation.invite_code)
                                                        }
                                                        title="Copy code"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-copy"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => handleCopyLink(invitation)}
                                                        title="Copy link"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-link"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => handleShare(invitation)}
                                                        title="Share"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-share"></i>
                                                    </button>
                                                    {invitation.status === "pending" &&
                                                        invitation.invited_email && (
                                                            <button
                                                                className="btn btn-ghost btn-xs"
                                                                onClick={() =>
                                                                    handleResend(invitation.id)
                                                                }
                                                                disabled={
                                                                    resendingId === invitation.id
                                                                }
                                                                title="Resend email"
                                                            >
                                                                {resendingId === invitation.id ? (
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                ) : (
                                                                    <i className="fa-duotone fa-regular fa-envelope"></i>
                                                                )}
                                                            </button>
                                                        )}
                                                    {invitation.status === "pending" && (
                                                        <button
                                                            className="btn btn-ghost btn-xs text-error"
                                                            onClick={() =>
                                                                handleRevoke(invitation.id)
                                                            }
                                                            disabled={revokingId === invitation.id}
                                                            title="Revoke"
                                                        >
                                                            {revokingId === invitation.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-ban"></i>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Card view for mobile */}
                    <div className="lg:hidden grid gap-4">
                        {invitations.map((invitation) => (
                            <InvitationCard
                                key={invitation.id}
                                invitation={invitation}
                                onCopyCode={() => handleCopyCode(invitation.invite_code)}
                                onCopyLink={() => handleCopyLink(invitation)}
                                onShare={() => handleShare(invitation)}
                                onResend={
                                    invitation.status === "pending" &&
                                    invitation.invited_email
                                        ? () => handleResend(invitation.id)
                                        : undefined
                                }
                                onRevoke={
                                    invitation.status === "pending"
                                        ? () => handleRevoke(invitation.id)
                                        : undefined
                                }
                                isResending={resendingId === invitation.id}
                                isRevoking={revokingId === invitation.id}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <PaginationControls
                            page={page}
                            totalPages={pagination.total_pages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

            {/* Create Modal */}
            <CreateInvitationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
