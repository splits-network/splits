'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useStandardList, LoadingState, SearchInput, ViewModeToggle, PaginationControls, EmptyState, ErrorState } from '@/hooks/use-standard-list';
import { useUserProfile } from '@/contexts';
import { formatDate, getVerificationStatusBadge, getVerificationStatusIcon } from '@/lib/utils';
import CandidateCard, { type Candidate } from './candidate-card';
import { CandidateTableRow } from './candidate-table-row';
import AddCandidateModal from './add-candidate-modal';
import { useToast } from '@/lib/toast-context';
import { StatCardGrid, StatCard } from '@/components/ui';
import { DataTable, type TableColumn } from '@/components/ui/tables';
import { CandidatesTrendsChart, TIME_PERIODS, calculateCandidateStatTrends } from '@/components/charts/candidates-trends-chart';


interface CandidateFilters {
    scope: 'mine' | 'all';
}

// ===== TABLE COLUMNS =====

const candidateColumns: TableColumn[] = [
    { key: 'full_name', label: 'Candidate', sortable: true },
    { key: 'verification_status', label: 'Status', sortable: true },
    // 'relationship' column is conditional based on isRecruiter and handled in component
    { key: 'links', label: 'Links' },
    { key: 'created_at', label: 'Added', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
];

// ===== COMPONENT =====

export default function CandidatesListClient() {
    const { getToken } = useAuth();
    const toast = useToast();
    const { isRecruiter } = useUserProfile();
    const [showAddModal, setShowAddModal] = useState(false);
    const [trendPeriod, setTrendPeriod] = useState(6);

    // Memoize fetchCandidates to prevent infinite re-renders in useStandardList
    const fetchCandidates = useCallback(async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        const response = await client.get('/candidates', { params });

        return {
            data: (response.data || []) as Candidate[],
            pagination: response.pagination || { total: 0, page: 1, limit: 25, total_pages: 0 }
        };
    }, [getToken]);

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<CandidateFilters>(() => ({ scope: 'mine' }), []);

    const {
        data: candidates,
        loading,
        error,
        pagination,
        filters,
        searchInput,
        setSearchInput,
        clearSearch,
        sortBy,
        sortOrder,
        viewMode,
        setFilters,
        goToPage,
        handleSort,
        setViewMode,
        setLimit,
        refetch
    } = useStandardList<Candidate, CandidateFilters>({
        fetchFn: fetchCandidates,
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        storageKey: 'candidatesViewMode'
    });

    // Calculate stat trends based on selected time period
    const statTrends = useMemo(() =>
        calculateCandidateStatTrends(candidates, trendPeriod),
        [candidates, trendPeriod]
    );

    const handleAddCandidateSuccess = (newCandidate: Candidate) => {
        refetch();
        toast.success('Invitation sent to candidate successfully!');
    };

    // Sort icon helper for table headers
    const getSortIcon = (field: string) => {
        if (sortBy !== field) return 'fa-sort';
        return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    if (loading && candidates.length === 0) {
        return <LoadingState message="Loading candidates..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={refetch} />;
    }

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className='w-full md:flex-1 md:mr-4 space-y-6'>
                <div className='card bg-base-200'>
                    <StatCardGrid className='m-2 shadow-lg'>
                        <StatCard
                            title='Total Candidates'
                            icon="fa-users"
                            value={pagination.total}
                            trend={statTrends.total}
                            trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                        />
                        <StatCard
                            title='New Candidates'
                            icon="fa-user-plus"
                            value={candidates.filter(c => c.is_new).length}
                            trend={statTrends.total}
                            trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                        />
                        {isRecruiter && (
                            <StatCard
                                title='Sourced by You'
                                icon="fa-user-astronaut"
                                value={candidates.filter(c => c.is_sourcer).length}
                            />
                        )}
                        {isRecruiter && (
                            <StatCard
                                title='With Active Relationships'
                                icon="fa-handshake"
                                value={candidates.filter(c => c.has_active_relationship).length}
                                trend={statTrends.withRelationships}
                                trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                            />
                        )}
                    </StatCardGrid>
                    <div className='p-4 pt-0'>
                        <CandidatesTrendsChart
                            candidates={candidates}
                            loading={loading && candidates.length === 0}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>

                {/* Loading overlay for subsequent fetches */}
                {loading && candidates.length > 0 && <LoadingState />}

                {/* Grid View */}
                {viewMode === 'grid' && candidates.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {candidates.map((candidate) => (
                            <CandidateCard candidate={candidate} key={candidate.id} />
                        ))}
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && candidates.length > 0 && (
                    <DataTable
                        columns={candidateColumns}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        showExpandColumn={true}
                        isEmpty={candidates.length === 0}
                        loading={loading}
                    >
                        {candidates.map((candidate) => (
                            <CandidateTableRow
                                key={candidate.id}
                                candidate={candidate}
                                isRecruiter={isRecruiter}
                            />
                        ))}
                    </DataTable>
                )}

                {/* Empty State */}
                {!loading && candidates.length === 0 && (
                    <EmptyState
                        icon="fa-users"
                        title="No Candidates Found"
                        description={
                            searchInput
                                ? 'Try adjusting your search or filters'
                                : 'Submit candidates to roles to see them appear here'
                        }
                    />
                )}

                {/* Pagination Controls */}
                <PaginationControls
                    page={pagination.page}
                    totalPages={pagination.total_pages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            </div>
            <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0 space-y-6">
                {/* Add Candidate Sidebar */}
                <div className="card bg-base-200 shadow">
                    <div className="card-body p-4">
                        <h3 className="font-semibold text-lg mb-2">Add New Candidate</h3>
                        <p className="text-base-content/70 mb-4">
                            Quickly add a new candidate to your database.
                        </p>
                        <button
                            className="btn btn-primary w-full"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="fa-duotone fa-regular fa-plus"></i>
                            Add Candidate
                        </button>
                    </div>
                </div>
                {/* Filters and View Toggle */}
                <div className="card bg-base-200 shadow">
                    <div className="card-body p-4">
                        <h3 className='card-title'>
                            Filters & View
                            <span className="text-base-content/30">•••</span>
                        </h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Scope Filter - Only show for recruiters */}
                            {isRecruiter && (
                                <div className="fieldset w-full">
                                    <select
                                        name="scope-filter"
                                        className="select w-full"
                                        value={filters.scope}
                                        onChange={(e) => setFilters({ scope: e.target.value as 'mine' | 'all' })}
                                    >
                                        <option value="mine">My Candidates</option>
                                        <option value="all">All Candidates</option>
                                    </select>
                                </div>
                            )}

                            {/* Search */}
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                onClear={clearSearch}
                                placeholder="Search candidates..."
                                loading={loading}
                                className="flex-1 min-w-[200px]"
                            />

                            {/* View Toggle */}
                            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Candidate Modal */}
            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddCandidateSuccess}
            />
        </div>
    );
}
