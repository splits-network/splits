'use client';

import Link from 'next/link';
import { useStandardList } from '@/hooks/use-standard-list';
import {
    PaginationControls,
    LoadingState,
    ErrorState,
    EmptyState
} from '@/components/standard-lists';
import JobTableRow from './job-table-row';
import JobsStats from './jobs-stats';
import JobsFilters from './jobs-filters';
import { formatSalary, formatDate, getRoleBadges } from '@/lib/utils';

interface Job {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    employment_type: string | null;
    salary_min: number | null;
    salary_max: number | null;
    category: string | null;
    open_to_relocation: boolean;
    posted_at: string;
    application_count?: number;
    created_at: string | Date;
    company?: {
        id: string;
        name: string;
        logo_url: string | null;
        headquarters_location: string | null;
        industry: string | null;
    };
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

function buildStats(jobs: Job[], totalJobs: number): JobStats {
    const remoteFriendly = jobs.filter(j => j.open_to_relocation).length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = jobs.filter(j => {
        if (!j.posted_at) return false;
        const posted = new Date(j.posted_at);
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
        viewMode,
        setViewMode,
        page,
        goToPage,
        totalPages,
        total,
    } = useStandardList<Job, JobFilters>({
        endpoint: '/jobs',
        defaultLimit: 25,
        syncToUrl: true,
        viewModeKey: 'jobsViewMode',
        autoFetch: true,
    });

    const stats = jobs.length > 0 ? buildStats(jobs, pagination?.total || 0) : null;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <JobsStats stats={stats} loading={loading && !jobs.length} />

            {/* Search and View Toggle */}
            <JobsFilters
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Results Count */}
            <div className="text-sm text-base-content/70">
                {loading ? (
                    'Loading jobs...'
                ) : total > 0 ? (
                    <>
                        Showing {((page - 1) * (pagination?.limit || 25)) + 1}-{Math.min(page * (pagination?.limit || 25), total)} of {total} {total === 1 ? 'job' : 'jobs'}
                        {searchInput && ' (filtered)'}
                    </>
                ) : (
                    'No jobs to display yet.'
                )}
            </div>

            {/* Error State */}
            {error && <ErrorState message={error} />}

            {/* Loading State */}
            {loading && !jobs.length && <LoadingState />}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
                <EmptyState
                    icon="fa-briefcase"
                    title="No Jobs Found"
                    description={searchInput ? 'Try adjusting your search terms.' : 'Check back soon for new opportunities.'}
                />
            )}

            {/* Results */}
            {!loading && jobs.length > 0 && (
                <>
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map(job => {
                                const badges = getRoleBadges(job, jobs);
                                return (
                                    <div
                                        key={job.id}
                                        className="group card bg-base-100 border border-base-300 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Company header with solid background */}
                                        <div className="relative h-24 bg-linear-90 from-secondary/20 to-transparent flex items-center">
                                            {/* Company logo and info */}
                                            <div className="flex items-center gap-4 p-2">
                                                <div className={`avatar avatar-placeholder`}>
                                                    <div className={`bg-base-100 text-primary text-3xl font-bold w-16 p-2 rounded-full shadow-lg`}>
                                                        {job.company?.logo_url ? (
                                                            <img
                                                                src={job.company.logo_url}
                                                                alt={`${job.company.name} logo`}
                                                                className="w-20 h-20 object-contain rounded-lg"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.nextElementSibling?.removeAttribute('hidden');
                                                                }}
                                                            />
                                                        ) : (
                                                            (job.company?.name || 'C')[0].toUpperCase()
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-base font-semibold text-base-content/70 flex items-center gap-2">
                                                        <i className="fa-solid fa-building text-primary"></i>
                                                        {job.company?.name || 'Confidential Company'}
                                                    </p>
                                                    {(job.company?.headquarters_location || job.company?.industry) && (
                                                        <div className="mt-1 flex gap-2">
                                                            {job.company?.headquarters_location && (
                                                                <span className="badge badge-outline badge-sm gap-1">
                                                                    <i className="fa-solid fa-location-dot text-xs"></i>
                                                                    {job.company.headquarters_location}
                                                                </span>
                                                            )}
                                                            {job.company?.industry && (
                                                                <span className="badge badge-outline badge-sm gap-1">
                                                                    <i className="fa-solid fa-industry text-xs"></i>
                                                                    {job.company.industry}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status badges */}
                                            {badges.length > 0 && (
                                                <div className="absolute top-3 right-0 flex flex-col gap-2">
                                                    {badges.map((badge, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`badge ${badge.class} gap-1 shadow-lg rounded-e-none ${badge.animated ? 'animate-pulse' : ''} ${badge.tooltip ? 'tooltip tooltip-left' : ''}`}
                                                            data-tip={badge.tooltip}
                                                        >
                                                            <i className={`fa-solid mr-1 ${badge.icon}`}></i>
                                                            {badge.text && <span>{badge.text}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-body pb-6 space-y-4">
                                            {/* Job title */}
                                            <div className="">
                                                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {job.title}
                                                </h3>
                                            </div>

                                            {/* Description preview */}
                                            {job.description && (
                                                <p className="text-sm text-base-content/60 line-clamp-2 leading-relaxed">
                                                    {job.description}
                                                </p>
                                            )}

                                            {/* Job metadata */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                                {job.location && (
                                                    <span className="flex items-center gap-1.5 text-base-content/70">
                                                        <i className="fa-solid fa-location-dot text-primary"></i>
                                                        <span className="font-medium">{job.location}</span>
                                                    </span>
                                                )}
                                                {job.employment_type && (
                                                    <span className="flex items-center gap-1.5 text-base-content/70">
                                                        <i className="fa-solid fa-briefcase text-primary"></i>
                                                        <span className="font-medium">{job.employment_type.replace('_', '-')}</span>
                                                    </span>
                                                )}
                                                {job.open_to_relocation && (
                                                    <span className="flex items-center gap-1.5 text-base-content/70">
                                                        <i className="fa-solid fa-house-laptop text-primary"></i>
                                                        <span className="font-medium">Remote OK</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Category tag */}
                                            {job.category && (
                                                <div className="pt-2">
                                                    <span className="badge badge-outline badge-primary badge-sm">
                                                        {job.category}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Footer with salary and action */}
                                            <div className="flex items-center justify-between pt-4 border-t border-base-300">
                                                <div className="flex-1">
                                                    {job.salary_min && job.salary_max ? (
                                                        <div className="font-semibold text-base text-success">
                                                            {formatSalary(job.salary_min, job.salary_max)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-base-content/50">
                                                            Salary not disclosed
                                                        </div>
                                                    )}
                                                    {job.posted_at && (
                                                        <div className="text-xs text-base-content/50 mt-0.5">
                                                            Posted {formatDate(job.posted_at)}
                                                        </div>
                                                    )}
                                                </div>
                                                <Link href={`/public/jobs/${job.id}`} className="btn btn-primary btn-sm gap-2 group-hover:scale-105 transition-transform">
                                                    View Role
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div className="card bg-base-100 shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Role Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map(job => {
                                            const badges = getRoleBadges(job, jobs);
                                            return <JobTableRow key={job.id} job={job} badges={badges} />;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            limit={pagination?.limit || 25}
                            onPageChange={goToPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}
