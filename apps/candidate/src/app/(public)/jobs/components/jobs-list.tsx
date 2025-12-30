'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useViewMode } from '@/hooks/useViewMode';
import { formatSalary, formatDate } from '@/lib/utils';

interface Job {
    id: string;
    title: string;
    company?: { name: string };
    location?: string;
    category?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    open_to_relocation?: boolean;
    posted_at?: string;
    description?: string;
}

interface JobsResponse {
    data: Job[];
    total: number;
    limit?: number;
    offset: number;
}

interface JobStats {
    totalJobs: number;
    remoteFriendly: number;
    newThisWeek: number;
    avgSalary: number | null;
}

interface JobsListClientProps {
    initialSearch?: string;
    initialLocation?: string;
    initialType?: string;
    initialPage?: number;
}

const JOBS_PER_PAGE = 20;

const buildStats = (jobs: Job[], total: number): JobStats => {
    const remoteFriendly = jobs.filter(job => job.open_to_relocation).length;

    const newThisWeek = jobs.filter(job => {
        if (!job.posted_at) return false;
        const postedDate = new Date(job.posted_at);
        const now = new Date();
        const diffDays = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }).length;

    const salarySamples = jobs
        .filter(job => typeof job.salary_min === 'number' && typeof job.salary_max === 'number')
        .map(job => ((job.salary_min ?? 0) + (job.salary_max ?? 0)) / 2);
    const avgSalary = salarySamples.length
        ? Math.round(salarySamples.reduce((sum, salary) => sum + salary, 0) / salarySamples.length)
        : null;

    return {
        totalJobs: total,
        remoteFriendly,
        newThisWeek,
        avgSalary,
    };
};

export default function JobsListClient({
    initialSearch = '',
    initialLocation = '',
    initialType = '',
    initialPage = 1,
}: JobsListClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [locationQuery, setLocationQuery] = useState(initialLocation);
    const [typeFilter, setTypeFilter] = useState(initialType);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<JobStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [viewMode, setViewMode] = useViewMode('candidateJobsViewMode');

    // Keep internal state in sync with URL updates
    useEffect(() => {
        const urlSearch = searchParams.get('q') || '';
        const urlLocation = searchParams.get('location') || '';
        const urlType = searchParams.get('employment_type') || '';
        const urlPage = searchParams.get('page');
        const urlPageNum = urlPage ? parseInt(urlPage, 10) : 1;

        if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
        if (urlLocation !== locationQuery) setLocationQuery(urlLocation);
        if (urlType !== typeFilter) setTypeFilter(urlType);
        if (!Number.isNaN(urlPageNum) && urlPageNum !== currentPage) {
            setCurrentPage(urlPageNum);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Reflect local state into the URL for sharable filters
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (locationQuery) params.set('location', locationQuery);
        if (typeFilter) params.set('employment_type', typeFilter);
        if (currentPage > 1) params.set('page', currentPage.toString());

        const newUrl = params.toString() ? `/jobs?${params.toString()}` : '/jobs';
        router.replace(newUrl, { scroll: false });
    }, [searchQuery, locationQuery, typeFilter, currentPage, router]);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setStatsLoading(true);

            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (locationQuery) params.set('location', locationQuery);
            if (typeFilter) params.set('employment_type', typeFilter);

            const offset = (currentPage - 1) * JOBS_PER_PAGE;
            params.set('limit', JOBS_PER_PAGE.toString());
            params.set('offset', offset.toString());

            const response = await apiClient.get<JobsResponse>(`/public/jobs?${params.toString()}`);
            const fetchedJobs = response.data || [];

            setJobs(fetchedJobs);
            setTotal(response.total || fetchedJobs.length);
            setStats(buildStats(fetchedJobs, response.total || fetchedJobs.length));
            setError(null);
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
            setError('Failed to load jobs. Please try again later.');
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    }, [currentPage, locationQuery, searchQuery, typeFilter]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setLocationQuery('');
        setTypeFilter('');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(total / JOBS_PER_PAGE);
    const hasActiveFilters = Boolean(searchQuery || locationQuery || typeFilter);
    const listIsLoading = loading;

    return (
        <div className="space-y-6">
            {statsLoading ? (
                <div className="flex justify-center py-6">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <i className="fa-solid fa-briefcase text-3xl"></i>
                            </div>
                            <div className="stat-title">Open Roles</div>
                            <div className="stat-value">{stats.totalJobs}</div>
                            <div className="stat-desc">Across the network</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-info">
                                <i className="fa-solid fa-house-laptop text-3xl"></i>
                            </div>
                            <div className="stat-title">Remote Friendly</div>
                            <div className="stat-value">{stats.remoteFriendly}</div>
                            <div className="stat-desc">Open to remote</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-success">
                                <i className="fa-solid fa-calendar-plus text-3xl"></i>
                            </div>
                            <div className="stat-title">New This Week</div>
                            <div className="stat-value text-success">{stats.newThisWeek}</div>
                            <div className="stat-desc">Fresh postings</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-secondary">
                                <i className="fa-solid fa-dollar-sign text-3xl"></i>
                            </div>
                            <div className="stat-title">Avg. Salary</div>
                            <div className="stat-value text-secondary">
                                {stats.avgSalary ? `$${stats.avgSalary.toLocaleString()}` : '—'}
                            </div>
                            <div className="stat-desc">Based on postings</div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow">
                <div className="card-body p-2 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <fieldset className="fieldset flex-1 min-w-[220px]">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="e.g. Director remote 100k"
                                    className="input w-full pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"></i>
                            </div>
                        </fieldset>

                        <fieldset className="fieldset flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="City, state, or remote"
                                className="input w-full"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </fieldset>

                        <fieldset className="fieldset min-w-[180px]">
                            <select
                                className="select w-full"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="full_time">Full-time</option>
                                <option value="contract">Contract</option>
                                <option value="temporary">Temporary</option>
                            </select>
                        </fieldset>

                        <div className="fieldset ml-auto">
                            <div className="join">
                                <button
                                    type="button"
                                    className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <i className="fa-solid fa-grip"></i>
                                </button>
                                <button
                                    type="button"
                                    className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setViewMode('table')}
                                    title="Table view"
                                >
                                    <i className="fa-solid fa-table"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="font-semibold uppercase text-xs text-base-content/60">Active:</span>
                    {searchQuery && (
                        <span className="badge badge-outline gap-2">
                            Keyword: {searchQuery}
                            <button onClick={() => setSearchQuery('')} className="hover:text-error">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </span>
                    )}
                    {locationQuery && (
                        <span className="badge badge-outline gap-2">
                            Location: {locationQuery}
                            <button onClick={() => setLocationQuery('')} className="hover:text-error">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </span>
                    )}
                    {typeFilter && (
                        <span className="badge badge-outline gap-2">
                            Type: {typeFilter.replace('_', ' ')}
                            <button onClick={() => setTypeFilter('')} className="hover:text-error">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </span>
                    )}
                </div>
            )}

            <div className="text-sm text-base-content/70">
                {listIsLoading ? (
                    'Loading jobs...'
                ) : total > 0 ? (
                    <>
                        Showing {((currentPage - 1) * JOBS_PER_PAGE) + 1}-{Math.min(currentPage * JOBS_PER_PAGE, total)} of {total} {total === 1 ? 'job' : 'jobs'}
                        {hasActiveFilters && ' (filtered)'}
                    </>
                ) : (
                    'No jobs to display yet.'
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {listIsLoading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : jobs.length === 0 ? (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-briefcase text-6xl text-base-content/20 mb-4"></i>
                        <h3 className="text-xl font-semibold">No Jobs Found</h3>
                        <p className="text-base-content/70 mt-2">
                            {hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'Check back soon for new opportunities.'}
                        </p>
                        {hasActiveFilters && (
                            <button className="btn btn-primary mt-4" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.map(job => (
                                <Link
                                    key={job.id}
                                    href={`/jobs/${job.id}`}
                                    className="card card-lg bg-base-100 shadow border border-base-200 hover:shadow-lg transition-shadow"
                                >
                                    <div className="card-body space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <h2 className="card-title text-2xl">{job.title}</h2>
                                                <p className="text-lg font-semibold text-base-content/80">{job.company?.name || 'Confidential'}</p>
                                                <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
                                                    {job.location && (
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-solid fa-location-dot"></i>
                                                            {job.location}
                                                        </span>
                                                    )}
                                                    {job.employment_type && (
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-solid fa-briefcase"></i>
                                                            {job.employment_type.replace('_', '-')}
                                                        </span>
                                                    )}
                                                    {job.open_to_relocation && (
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-solid fa-house-laptop"></i>
                                                            Remote Friendly
                                                        </span>
                                                    )}
                                                    {job.posted_at && (
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-solid fa-calendar"></i>
                                                            Posted {formatDate(job.posted_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {job.salary_min && job.salary_max && (
                                                <div className="shrink-0 flex items-center justify-center px-4 py-1 rounded-full bg-primary text-primary-content text-sm font-semibold whitespace-nowrap">
                                                    {formatSalary(job.salary_min, job.salary_max)}
                                                </div>
                                            )}
                                        </div>
                                        {job.description && (
                                            <p className="text-base-content/70 line-clamp-3">{job.description}</p>
                                        )}
                                        <div className="card-actions justify-end">
                                            <span className="btn btn-link px-0">View details →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div className="card bg-base-100 shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Role</th>
                                            <th>Company</th>
                                            <th>Location</th>
                                            <th>Compensation</th>
                                            <th>Posted</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map(job => (
                                            <tr key={job.id} className="hover">
                                                <td>
                                                    <div className="font-semibold">{job.title}</div>
                                                    <div className="text-sm text-base-content/60">
                                                        {job.employment_type ? job.employment_type.replace('_', '-') : '—'}
                                                    </div>
                                                </td>
                                                <td>{job.company?.name || 'Confidential'}</td>
                                                <td>{job.location || '—'}</td>
                                                <td>
                                                    {job.salary_min && job.salary_max ? (
                                                        formatSalary(job.salary_min, job.salary_max)
                                                    ) : (
                                                        <span className="text-base-content/40">—</span>
                                                    )}
                                                </td>
                                                <td>{job.posted_at ? formatDate(job.posted_at) : '—'}</td>
                                                <td>
                                                    <div className="flex justify-end">
                                                        <Link href={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                                                            View
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

                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-sm text-base-content/70">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="join">
                                <button
                                    className="join-item btn"
                                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fa-solid fa-angle-left"></i>
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = idx + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = idx + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + idx;
                                    } else {
                                        pageNum = currentPage - 2 + idx;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`join-item btn ${pageNum === currentPage ? 'btn-active' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    className="join-item btn"
                                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <i className="fa-solid fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
