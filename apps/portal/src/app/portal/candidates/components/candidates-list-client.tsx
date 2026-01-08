'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useStandardList, LoadingState, SearchInput, ViewModeToggle, PaginationControls } from '@/hooks/use-standard-list';
import { useUserProfile } from '@/contexts';
import { formatDate, getVerificationStatusBadge, getVerificationStatusIcon } from '@/lib/utils';
import CandidateCard, { type Candidate } from './candidate-card';
import AddCandidateModal from './add-candidate-modal';
import { useToast } from '@/lib/toast-context';
import { StatCardGrid, StatCard } from '@/components/ui';
import { CandidatesTrendsChart, TIME_PERIODS, calculateCandidateStatTrends } from '@/components/charts/candidates-trends-chart';


interface CandidateFilters {
    scope: 'mine' | 'all';
}

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
        searchQuery,
        sortBy,
        sortOrder,
        viewMode,
        setFilters,
        setSearchInput,
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
                <button className="btn btn-sm btn-ghost" onClick={refetch}>
                    <i className="fa-solid fa-rotate"></i>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className='w-full md:flex-1 md:mr-4 space-y-6'>
                <div className='card bg-base-200'>
                    <StatCardGrid className='m-2 shadow-lg'>
                        <StatCard
                            title='Total Candidates'
                            value={pagination.total}
                            trend={statTrends.total}
                            trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                        />
                        <StatCard
                            title='New Candidates'
                            value={candidates.filter(c => c.is_new).length}
                            trend={statTrends.total}
                            trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                        />
                        {isRecruiter && (
                            <StatCard
                                title='Sourced by You'
                                value={candidates.filter(c => c.is_sourcer).length}
                            />
                        )}
                        {isRecruiter && (
                            <StatCard
                                title='With Active Relationships'
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
                    <div className="card bg-base-200 shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th
                                            className="cursor-pointer hover:bg-base-200 select-none"
                                            onClick={() => handleSort('full_name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Candidate
                                                <i className={`fa-solid ${getSortIcon('full_name')} text-xs opacity-50`}></i>
                                            </div>
                                        </th>
                                        <th
                                            className="cursor-pointer hover:bg-base-200 select-none"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Email
                                                <i className={`fa-solid ${getSortIcon('email')} text-xs opacity-50`}></i>
                                            </div>
                                        </th>
                                        <th
                                            className="cursor-pointer hover:bg-base-200 select-none"
                                            onClick={() => handleSort('verification_status')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Status
                                                <i className={`fa-solid ${getSortIcon('verification_status')} text-xs opacity-50`}></i>
                                            </div>
                                        </th>
                                        {isRecruiter && <th>Relationship</th>}
                                        <th>Links</th>
                                        <th
                                            className="cursor-pointer hover:bg-base-200 select-none"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Added
                                                <i className={`fa-solid ${getSortIcon('created_at')} text-xs opacity-50`}></i>
                                            </div>
                                        </th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-primary/10 text-primary rounded-full w-10">
                                                            <span className="text-sm">
                                                                {(() => {
                                                                    const names = candidate.full_name.split(' ');
                                                                    const firstInitial = names[0]?.[0]?.toUpperCase() || '';
                                                                    const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
                                                                    return names.length > 1 ? firstInitial + lastInitial : firstInitial;
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/portal/candidates/${candidate.id}`} className="font-semibold hover:text-primary transition-colors">
                                                        {candidate.full_name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td>
                                                <a href={`mailto:${candidate.email}`} className="link link-hover text-sm">
                                                    {candidate.email}
                                                </a>
                                            </td>
                                            <td>
                                                {candidate.verification_status && (
                                                    <span className={`badge badge-sm ${getVerificationStatusBadge(candidate.verification_status)} gap-1`}>
                                                        <i className={`fa-solid ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                                                        {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                                                    </span>
                                                )}
                                            </td>
                                            {isRecruiter && (
                                                <td>
                                                    <div className="flex gap-1">
                                                        {candidate.is_sourcer && (
                                                            <span className="badge badge-sm badge-primary gap-1" title="You sourced this candidate">
                                                                <i className="fa-solid fa-star"></i>
                                                                Sourcer
                                                            </span>
                                                        )}
                                                        {candidate.has_active_relationship && (
                                                            <span className="badge badge-sm badge-success gap-1" title="Active relationship">
                                                                <i className="fa-solid fa-handshake"></i>
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td>
                                                <div className="flex gap-1">
                                                    {candidate.linkedin_url && (
                                                        <a
                                                            href={candidate.linkedin_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-ghost btn-sm"
                                                            title="View LinkedIn Profile"
                                                        >
                                                            <i className="fa-brands fa-linkedin text-blue-600"></i>
                                                        </a>
                                                    )}
                                                    {candidate.portfolio_url && (
                                                        <a
                                                            href={candidate.portfolio_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-ghost btn-sm"
                                                            title="View Portfolio"
                                                        >
                                                            <i className="fa-solid fa-globe text-purple-600"></i>
                                                        </a>
                                                    )}
                                                    {candidate.github_url && (
                                                        <a
                                                            href={candidate.github_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-ghost btn-sm"
                                                            title="View GitHub"
                                                        >
                                                            <i className="fa-brands fa-github text-gray-600"></i>
                                                        </a>
                                                    )}
                                                    {!candidate.linkedin_url && !candidate.portfolio_url && !candidate.github_url && (
                                                        <span className="text-base-content/40">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-sm text-base-content/70">
                                                {formatDate(candidate.created_at)}
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <Link
                                                        href={`/portal/candidates/${candidate.id}`}
                                                        className="btn btn-primary btn-sm"
                                                        title="View Details"
                                                    >
                                                        <i className="fa-solid fa-arrow-right"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {candidates.length === 0 && !loading && (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body text-center py-12">
                            <i className="fa-solid fa-users text-6xl text-base-content/20"></i>
                            <h3 className="text-xl font-semibold mt-4">No Candidates Found</h3>
                            <p className="text-base-content/70 mt-2">
                                {searchQuery ? 'Try adjusting your search' : 'Submit candidates to roles to see them appear here'}
                            </p>
                            {!searchQuery && (
                                <button
                                    className="btn btn-primary mt-4"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Add Your First Candidate
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                <PaginationControls
                    pagination={pagination}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
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
                            <i className="fa-solid fa-plus"></i>
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
                        <div className="flex flex-wrap gap-4 items-end">
                            {/* Scope Filter - Only show for recruiters */}
                            {isRecruiter && (
                                <div className="fieldset w-full">
                                    <select
                                        className="select"
                                        value={filters.scope}
                                        onChange={(e) => setFilters({ scope: e.target.value as 'mine' | 'all' })}
                                    >
                                        <option value="mine">My Candidates</option>
                                        <option value="all">All Candidates</option>
                                    </select>
                                </div>
                            )}

                            {/* Sort dropdown for grid view */}
                            {viewMode === 'grid' && (
                                <div className="fieldset w-full">
                                    <select
                                        className="select"
                                        value={`${sortBy}-${sortOrder}`}
                                        onChange={(e) => {
                                            const [field] = e.target.value.split('-');
                                            handleSort(field);
                                        }}
                                    >
                                        <option value="created_at-desc">Newest First</option>
                                        <option value="created_at-asc">Oldest First</option>
                                        <option value="full_name-asc">Name (A-Z)</option>
                                        <option value="full_name-desc">Name (Z-A)</option>
                                        <option value="email-asc">Email (A-Z)</option>
                                        <option value="email-desc">Email (Z-A)</option>
                                    </select>
                                </div>
                            )}

                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchInput}
                                className="flex-1 min-w-[150px]"
                                placeholder="Search by name or email..."
                                loading={loading}
                            />

                            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
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
