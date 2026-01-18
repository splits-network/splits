'use client';

import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { EmptyState, LoadingState, PaginationControls, useStandardList } from '@/hooks/use-standard-list';
import { useToast } from '@/lib/toast-context';
import ConfirmDialog from '@/components/confirm-dialog';
import { InvitationCard, type RecruiterCandidate } from './invitation-card';
import { InvitationTableRow } from './invitation-table-row';
import { DataTable, type TableColumn } from '@/components/ui';
import { InvitationsFiltersPanel } from './invitations-filters-panel';
import InvitationsStats from './invitations-stats';
import AddCandidateModal from '../../candidates/components/add-candidate-modal';
import { Candidate } from '@splits-network/shared-types';

interface InvitationFilters {
    status: string;
}

// ===== TABLE COLUMNS =====

const invitationColumns: TableColumn[] = [
    { key: 'candidate.full_name', label: 'Candidate', sortable: true },
    { key: 'invited_at', label: 'Invited', sortable: true },
    { key: 'invitation_expires_at', label: 'Expires', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
];

function StatsLoading() {
    return (
        <div className='card bg-base-200'>
            <div className='p-8 flex items-center justify-center'>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    );
}

// ===== COMPONENT =====

export default function InvitationsPageClient() {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();

    // Stats state (separate from filtered data)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Action state
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Send new invitation state
    const [showAddModal, setShowAddModal] = useState(false);
    const [candidateEmail, setCandidateEmail] = useState('');
    const [sendingInvitation, setSendingInvitation] = useState(false);

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<InvitationFilters>(() => ({
        status: ''
    }), []);

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
        viewMode,
        setViewMode,
        refresh,
    } = useStandardList<RecruiterCandidate, InvitationFilters>({
        endpoint: '/recruiter-candidates',
        include: 'candidate',
        //fetchFn: fetchInvitations,
        defaultFilters,
        defaultSortBy: 'invited_at',
        defaultSortOrder: 'desc',
        storageKey: 'invitationsViewMode'

    });

    // Memoize callback functions for filters panel to prevent unnecessary re-renders
    const handleStatusFilterChange = useCallback((value: string) => {
        setFilter('status', value);
    }, [setFilter]);

    const handleSearchInputChange = useCallback((value: string) => {
        setSearchInput(value);
    }, [setSearchInput]);

    const handleClearSearch = useCallback(() => {
        clearSearch();
    }, [clearSearch]);

    const handleViewModeChange = useCallback((mode: 'grid' | 'table') => {
        setViewMode(mode);
    }, [setViewMode]);

    const handleAddCandidateSuccess = (newCandidate: Candidate) => {
        refresh();
        toast.success('Invitation sent to candidate successfully!');
    };

    const handleResendInvitation = async (invitationId: string) => {
        try {
            setResendingId(invitationId);

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-candidates/${invitationId}`, {
                resend_invitation: true
            });

            await refresh();
            toast.success('Invitation resent successfully');
        } catch (err: any) {
            console.error('Failed to resend invitation:', err);
            toast.error(err.response?.data?.error || err.message || 'Failed to resend invitation');
        } finally {
            setResendingId(null);
        }
    };

    const handleCancelInvitation = (invitation: RecruiterCandidate) => {
        const candidateName = invitation.candidate?.full_name || 'this candidate';

        setConfirmDialog({
            isOpen: true,
            title: 'Cancel Invitation',
            message: `Are you sure you want to cancel the invitation for ${candidateName}? This action cannot be undone.`,
            onConfirm: () => confirmCancelInvitation(invitation)
        });
    };

    const confirmCancelInvitation = async (invitation: RecruiterCandidate) => {
        try {
            setCancellingId(invitation.id);
            setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });

            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-candidates/${invitation.id}`, {
                cancel_invitation: true
            });

            await refresh();
            toast.success('Invitation cancelled');
        } catch (err: any) {
            console.error('Failed to cancel invitation:', err);
            toast.error(err.response?.data?.error || err.message || 'Failed to cancel invitation');
        } finally {
            setCancellingId(null);
        }
    };

    // Loading state
    if (loading && invitations.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8 xl:col-span-10">
                <InvitationsStats />
            </div>
            <div className="col-span-12 md:col-span-4 xl:col-span-2">
                <InvitationsFiltersPanel
                    statusFilter={filters.status || ''}
                    onStatusFilterChange={handleStatusFilterChange}
                    searchInput={searchInput}
                    onSearchInputChange={handleSearchInputChange}
                    onClearSearch={handleClearSearch}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    isRecruiter={true}
                    onAddCandidate={() => setShowAddModal(true)}
                />
            </div>
            <div className="md:col-span-12 space-y-6">

                {/* Error */}
                {error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                        <button className="btn btn-sm btn-ghost" onClick={refresh}>
                            <i className="fa-duotone fa-regular fa-rotate"></i>
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && invitations.length === 0 && <LoadingState />}

                {/* Grid View */}
                {!loading && viewMode === 'grid' && invitations.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {invitations.map((invitation) => (
                            <InvitationCard
                                key={invitation.id}
                                invitation={invitation}
                                onResend={handleResendInvitation}
                                onCancel={handleCancelInvitation}
                                onViewDeclineReason={(reason) => toast.info(reason)}
                                resendingId={resendingId}
                                cancellingId={cancellingId}
                            />
                        ))}
                    </div>

                )}

                {!loading && viewMode === 'table' && invitations.length > 0 && (
                    <DataTable
                        columns={invitationColumns}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        showExpandColumn={true}
                        isEmpty={invitations.length === 0}
                        loading={loading}
                    >
                        {invitations.map((invitation) => (
                            <InvitationTableRow
                                key={invitation.id}
                                invitation={invitation}
                                onResend={handleResendInvitation}
                                onCancel={handleCancelInvitation}
                                onViewDeclineReason={(reason) => toast.info(reason)}
                                resendingId={resendingId}
                                cancellingId={cancellingId}
                            />
                        ))}
                    </DataTable>
                )}

                {!loading && invitations.length === 0 && (
                    <EmptyState
                        icon="fa-duotone fa-regular fa-inbox"
                        title="No invitations found"
                        description="Start adding candidates to send invitations"
                    />
                )}

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
            {/* Search and Filter Tabs */}
            <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0 space-y-6">
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } })}
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
