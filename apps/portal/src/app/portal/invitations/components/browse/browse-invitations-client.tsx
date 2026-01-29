"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    EmptyState,
    LoadingState,
    PaginationControls,
    SearchInput,
    useStandardList,
} from "@/hooks/use-standard-list";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";
import { InvitationsBrowseList } from "./invitations-browse-list";
import { InvitationsBrowseDetail } from "./invitations-browse-detail";
import ConfirmDialog from "@/components/confirm-dialog";
import AddCandidateModal from "../../../candidates/components/add-candidate-modal";
import { Candidate } from "@splits-network/shared-types";

interface InvitationFilters {
    status: string;
}

export function BrowseInvitationsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const toast = useToast();

    // Action state
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    // Memoize defaultFilters to prevent unnecessary re-renders
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
        sortBy,
        sortOrder,
        handleSort,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<RecruiterCandidateWithCandidate, InvitationFilters>({
        endpoint: "/recruiter-candidates",
        include: "candidate",
        defaultFilters,
        defaultSortBy: "invited_at",
        defaultSortOrder: "desc",
        storageKey: "invitationsBrowseViewMode",
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

    const handleAddCandidateSuccess = (newCandidate: Candidate) => {
        refresh();
        toast.success("Invitation sent to candidate successfully!");
    };

    const handleResendInvitation = async (invitationId: string) => {
        try {
            setResendingId(invitationId);

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-candidates/${invitationId}`, {
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
            setResendingId(null);
        }
    };

    const handleCancelInvitation = (
        invitation: RecruiterCandidateWithCandidate,
    ) => {
        const candidateName =
            invitation.candidate?.full_name || "this candidate";

        setConfirmDialog({
            isOpen: true,
            title: "Cancel Invitation",
            message: `Are you sure you want to cancel the invitation for ${candidateName}? This action cannot be undone.`,
            onConfirm: () => confirmCancelInvitation(invitation),
        });
    };

    const confirmCancelInvitation = async (
        invitation: RecruiterCandidateWithCandidate,
    ) => {
        try {
            setCancellingId(invitation.id);
            setConfirmDialog({
                isOpen: false,
                title: "",
                message: "",
                onConfirm: () => {},
            });

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
            setCancellingId(null);
        }
    };

    const handleViewDeclineReason = useCallback(
        (reason: string) => {
            toast.info(reason);
        },
        [toast],
    );

    if (loading && invitations.length === 0) {
        return <LoadingState />;
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
                        <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                        Invitations ({total})
                    </h3>

                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Search invitations..."
                                // @ts-ignore - passing className even if interface might not support it (defensive)
                                className="w-full"
                            />
                        </div>

                        <div
                            className="tooltip tooltip-bottom"
                            data-tip="Invite Candidate"
                        >
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-square btn-primary"
                                aria-label="Invite candidate"
                            >
                                <i className="fa-duotone fa-regular fa-plus text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-0 relative">
                    <InvitationsBrowseList
                        invitations={invitations}
                        selectedInvitation={selectedInvitation}
                        onSelectInvitation={(invitation) =>
                            handleSelect(invitation.id)
                        }
                        loading={loading}
                    />
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
                <InvitationsBrowseDetail
                    invitation={selectedInvitation}
                    onResend={handleResendInvitation}
                    onCancel={handleCancelInvitation}
                    onViewDeclineReason={handleViewDeclineReason}
                    onClose={handleClose}
                    resendingId={resendingId}
                    cancellingId={cancellingId}
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
                    })
                }
                confirmText="Cancel Invitation"
                cancelText="Keep Invitation"
                type="error"
                loading={cancellingId !== null}
            />

            {/* Add Candidate Modal */}
            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddCandidateSuccess}
            />
        </div>
    );
}
