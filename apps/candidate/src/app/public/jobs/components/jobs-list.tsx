'use client';

import { useStandardList } from '@/hooks/use-standard-list';
import {
    PaginationControls,
    LoadingState,
    ErrorState,
    EmptyState
} from '@/components/standard-lists';
import { DataTable, type TableColumn } from '@/components/ui/tables';
import { JobTableRow } from './job-table-row';
import JobsFilters from './jobs-filters';
import JobCard from './job-card';
import { StatCard, StatCardGrid } from '@/components/ui';

interface Job {
    id: string;
    title: string;
    description?: string | null;
    candidate_description?: string | null;
    location?: string | null;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    category?: string | null;
    department?: string;
    open_to_relocation?: boolean;
    updated_at?: string;
    created_at?: string | Date;
    status?: string;
    application_count?: number;
    company?: {
        id: string;
        name: string;
        logo_url?: string | null;
        headquarters_location?: string | null;
        industry?: string | null;
    };
    requirements?: Array<{
        id: string;
        requirement_type: 'mandatory' | 'preferred';
        description: string;
        sort_order: number;
    }>;
}

interface JobFilters {
    // No manual filters - intelligent search only
}

interface JobStats {
    totalJobs: number;
    remoteFriendly: number;
    newThisWeek: number;
    avgSalary: number | null;
}

// Define table columns
const jobColumns: TableColumn[] = [
    { key: 'title', label: 'Job Title', sortable: true },
    { key: 'company.name', label: 'Company', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'salary_min', label: 'Salary', sortable: true },
    { key: 'updated_at', label: 'Posted', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
];

function buildStats(jobs: Job[], totalJobs: number): JobStats {
    const remoteFriendly = jobs.filter(j => j.open_to_relocation).length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = jobs.filter(j => {
        if (!j.updated_at) return false;
        const posted = new Date(j.updated_at);
        return posted >= oneWeekAgo;
    }).length;

    const jobsWithSalary = jobs.filter(j => j.salary_min && j.salary_max);
    const avgSalary = jobsWithSalary.length > 0
        ? Math.round(jobsWithSalary.reduce((sum, j) => sum + ((j.salary_min! + j.salary_max!) / 2), 0) / jobsWithSalary.length)
        : null;

    return { totalJobs, remoteFriendly, newThisWeek, avgSalary };
}

export default function JobsList() {
    const {
        data: jobs,
        pagination,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        sortBy,
        sortOrder,
        handleSort,
        viewMode,
        setViewMode,
        page,
        limit,
        setLimit,
        goToPage,
        totalPages,
        total,
        refresh,
    } = useStandardList<Job, JobFilters>({
        endpoint: '/jobs',
        defaultLimit: 24,
        defaultSortBy: 'updated_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
        viewModeKey: 'jobsViewMode',
        autoFetch: true,
        requireAuth: false,
    });

    const stats = jobs.length > 0 ? buildStats(jobs, pagination?.total || 0) : null;

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className='w-full md-flex-1 md-mr-4 space-y-6'>
                <div className='card bg-base-200'>
                    <StatCardGrid className='m-2 shadow-lg'>
                        <StatCard
                            title="Total Jobs"
                            value={stats ? stats.totalJobs.toLocaleString() : '—'}
                            loading={loading && !jobs.length}
                            icon="fa-briefcase"
                        />
                        <StatCard
                            title="Remote Friendly"
                            value={stats ? stats.remoteFriendly.toLocaleString() : '—'}
                            loading={loading && !jobs.length}
                            icon="fa-house-laptop"
                        />
                        <StatCard
                            title="New This Week"
                            value={stats ? stats.newThisWeek.toLocaleString() : '—'}
                            loading={loading && !jobs.length}
                            icon="fa-calendar-plus"
                        />
                        <StatCard
                            title="Avg. Salary"
                            value={stats && stats.avgSalary ? `$${stats.avgSalary.toLocaleString()}` : '—'}
                            loading={loading && !jobs.length}
                            icon="fa-dollar-sign"
                        />
                    </StatCardGrid>

                </div>


                {/* Error State */}
                {error && <ErrorState message={error} onRetry={refresh} />}

                {/* Loading State */}
                {loading && !jobs.length && <LoadingState />}

                {/* Empty State */}
                {!loading && jobs.length === 0 && (
                    <EmptyState
                        icon="fa-briefcase"
                        title="No Jobs Found"
                        description={
                            searchInput
                                ? 'Try different search terms or clear your search.'
                                : 'Check back soon for new opportunities.'
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
                {viewMode === 'grid' && jobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && jobs.length > 0 && (
                    <DataTable
                        columns={jobColumns}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        showExpandColumn={true}
                        isEmpty={jobs.length === 0}
                        loading={loading}
                    >
                        {jobs.map((job) => (
                            <JobTableRow key={job.id} job={job} />
                        ))}
                    </DataTable>
                )}

                {/* Pagination */}
                {jobs.length > 0 && totalPages > 1 && (
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

                {/* Search and View Toggle */}
                <JobsFilters
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {/* Results Count */}
                {!loading && jobs.length > 0 && (
                    <div className="mb-4 text-sm text-base-content/70">
                        Showing {jobs.length} of {total} jobs
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
