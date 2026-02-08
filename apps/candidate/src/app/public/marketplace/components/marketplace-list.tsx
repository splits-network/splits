'use client';

import { useStandardList } from '@/hooks/use-standard-list';
import type { PaginationResponse } from '@splits-network/shared-types';
import { PaginationControls, LoadingState, ErrorState, EmptyState } from '@/components/standard-lists';
import { DataTable, type TableColumn } from '@/components/ui/tables';
import RecruiterCard from './recruiter-card';
import { RecruiterTableRow } from './recruiter-table-row';
import MarketplaceFilters from './marketplace-filters';

interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    tagline?: string;
    specialization?: string;
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
    user?: {
        id: string;
        name?: string;
        email?: string;
    };
}

interface RecruiterFilters {
    marketplace_enabled?: boolean;
    status?: string;
    specialization?: string;
}

// Define default filters outside component to maintain stable reference
const DEFAULT_FILTERS: RecruiterFilters = { marketplace_enabled: true };

// Define table columns
const recruiterColumns: TableColumn[] = [
    { key: 'users.name', label: 'Recruiter', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'reputation_score', label: 'Rating & Placements', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
];

interface MarketplaceListProps {
    initialData?: Recruiter[];
    initialPagination?: PaginationResponse;
}

export default function MarketplaceList({ initialData, initialPagination }: MarketplaceListProps) {
    const {
        data: recruiters,
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
    } = useStandardList<Recruiter, RecruiterFilters>({
        endpoint: '/recruiters',
        defaultFilters: DEFAULT_FILTERS,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        defaultLimit: 24,
        syncToUrl: true,
        viewModeKey: 'marketplaceViewMode',
        autoFetch: true,
        include: 'user,reputation',
        requireAuth: false,
        initialData,
        initialPagination,
    });

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className='w-full md:flex-1 md:mr-4 space-y-6'>

                {/* Error State */}
                {error && <ErrorState message={error} onRetry={refresh} />}

                {/* Loading State */}
                {loading && recruiters.length === 0 && <LoadingState />}

                {/* Empty State */}
                {!loading && recruiters.length === 0 && (
                    <EmptyState
                        icon="fa-users"
                        title="No recruiters found"
                        description={
                            searchInput
                                ? 'Try different search terms or clear your search.'
                                : 'Recruiters will appear here once they enable their marketplace profiles.'
                        }
                        action={
                            searchInput
                                ? {
                                    label: 'Clear search',
                                    onClick: clearSearch,
                                }
                                : undefined
                        }
                    />
                )}

                {/* Grid View */}
                {!loading && viewMode === 'grid' && recruiters.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                        {recruiters.map((recruiter) => (
                            <RecruiterCard key={recruiter.id} recruiter={recruiter} />
                        ))}
                    </div>
                )}

                {/* Table View */}
                {!loading && viewMode === 'table' && recruiters.length > 0 && (
                    <DataTable
                        columns={recruiterColumns}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        showExpandColumn={true}
                        isEmpty={recruiters.length === 0}
                        loading={loading}
                    >
                        {recruiters.map((recruiter) => (
                            <RecruiterTableRow key={recruiter.id} recruiter={recruiter} />
                        ))}
                    </DataTable>
                )}

                {/* Pagination */}
                {recruiters.length > 0 && totalPages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={limit}
                        onPageChange={goToPage}
                        onLimitChange={setLimit}
                    />
                )}
            </div>
            <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0 space-y-6">
                {/* Search Bar and View Toggle */}
                <MarketplaceFilters
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    onSearchClear={clearSearch}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
                {/* Results Count */}
                {!loading && recruiters.length > 0 && (
                    <div className="mb-4 text-sm text-base-content/70">
                        Showing {recruiters.length} of {total} recruiters
                        {searchInput && (
                            <span className="ml-2">
                                • Sorted by relevance
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
