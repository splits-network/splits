"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    LoadingState,
    PaginationControls,
    SearchInput,
    useStandardList,
} from "@/hooks/use-standard-list";
import { InvitationListItem } from "./invitation-list-item";
import { InvitationDetailPanel } from "./invitation-detail-panel";
import ConfirmDialog from "@/components/confirm-dialog";

interface RecruiterCompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: "sourcer" | "recruiter";
    status: "pending" | "active" | "declined" | "terminated";
    can_manage_company_jobs: boolean;
    relationship_start_date?: string;
    relationship_end_date?: string;
    termination_reason?: string;
    invited_by?: string;
    created_at: string;
    updated_at: string;
    // Enriched data
    recruiter?: {
        id: string;
        user_id: string;
        user?: { name: string; email: string };
    };
    company?: {
        id: string;
        name: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
}

interface InvitationFilters {
    status?: string;
}

export function CompanyInvitationsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const toast = useToast();

    // Action state
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: "info" | "error";
        confirmText: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        type: "info",
        confirmText: "Confirm",
    });

    // Memoize defaultFilters
    const defaultFilters = useMemo<InvitationFilters>(
        () => ({
            status: "",
        }),
        [],
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
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<RecruiterCompanyRelationship, InvitationFilters>({
        endpoint: "/recruiter-companies",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        storageKey: "companyInvitationsViewMode",
    });

    // ID from URL is our source of truth for selection
    const selectedId = searchParams.get("invitationId");
    const selectedInvitation = useMemo(() => {
        if (!selectedId) return null;
        return invitations.find((inv) => inv.id === selectedId) || null;
    }, [selectedId, invitations]);

    // URL sync handlers
    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("invitationId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("invitationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const handleAccept = useCallback(
        (invitation: RecruiterCompanyRelationship) => {
            const companyName = invitation.company?.name || "this company";

            setConfirmDialog({
                isOpen: true,
                title: "Accept Invitation",
                message: `Are you sure you want to accept the invitation from ${companyName}? You will be able to work with them on their job postings.`,
                type: "info",
                confirmText: "Accept",
                onConfirm: () => confirmResponse(invitation, true),
            });
        },
        [],
    );

    const handleDecline = useCallback(
        (invitation: RecruiterCompanyRelationship) => {
            const companyName = invitation.company?.name || "this company";

            setConfirmDialog({
                isOpen: true,
                title: "Decline Invitation",
                message: `Are you sure you want to decline the invitation from ${companyName}? This action cannot be undone.`,
                type: "error",
                confirmText: "Decline",
                onConfirm: () => confirmResponse(invitation, false),
            });
        },
        [],
    );

    const confirmResponse = async (
        invitation: RecruiterCompanyRelationship,
        accept: boolean,
    ) => {
        try {
            setRespondingId(invitation.id);
            setConfirmDialog({
                isOpen: false,
                title: "",
                message: "",
                onConfirm: () => {},
                type: "info",
                confirmText: "Confirm",
            });

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-companies/${invitation.id}/respond`, {
                accept,
            });

            await refresh();
            toast.success(
                accept
                    ? "Invitation accepted! You can now work with this company."
                    : "Invitation declined.",
            );
        } catch (err: any) {
            console.error("Failed to respond to invitation:", err);
            toast.error(
                err.response?.data?.error?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Failed to respond to invitation",
            );
        } finally {
            setRespondingId(null);
        }
    };

    if (loading && invitations.length === 0) {
        return <LoadingState message="Loading invitations..." />;
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{error}</span>
                <button className="btn btn-sm btn-ghost" onClick={refresh}>
                    <i className="fa-duotone fa-regular fa-rotate"></i>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-base-200 rounded-xl overflow-hidden shadow-sm border border-base-300">
            {/* List Panel */}
            <div
                className={`
                flex flex-col border-r border-base-300 bg-base-200
                w-full md:w-96 lg:w-[420px]
                ${selectedId ? "hidden md:flex" : "flex"}
            `}
            >
                {/* Header / Search Area */}
                <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                    <h3 className="text-lg font-semibold mb-4">
                        <i className="fa-duotone fa-regular fa-building-user mr-2"></i>
                        Invitations ({total})
                    </h3>

                    {/* Search & Filters */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Search invitations..."
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            className="select w-full select-sm"
                            value={filters.status || ""}
                            onChange={(e) => setFilter("status", e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-0 relative">
                    {invitations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                            <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3 opacity-50" />
                            <p>No invitations found</p>
                            <p className="text-sm mt-1">
                                When companies invite you, they&apos;ll appear here
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-base-300">
                            {invitations.map((invitation) => (
                                <InvitationListItem
                                    key={invitation.id}
                                    invitation={invitation}
                                    isSelected={selectedInvitation?.id === invitation.id}
                                    onSelect={() => handleSelect(invitation.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-base-300 bg-base-100/50 flex justify-center p-2">
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        total={total}
                        limit={limit}
                        onLimitChange={setLimit}
                        loading={loading}
                        compact={true}
                    />
                </div>
            </div>

            {/* Detail Panel */}
            <div
                className={`
                flex-1 flex-col bg-base-100 min-w-0
                ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }
            `}
            >
                <InvitationDetailPanel
                    invitation={selectedInvitation}
                    onClose={handleClose}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    isResponding={respondingId !== null}
                />
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() =>
                    setConfirmDialog({
                        isOpen: false,
                        title: "",
                        message: "",
                        onConfirm: () => {},
                        type: "info",
                        confirmText: "Confirm",
                    })
                }
                confirmText={confirmDialog.confirmText}
                cancelText="Cancel"
                type={confirmDialog.type}
                loading={respondingId !== null}
            />
        </div>
    );
}
