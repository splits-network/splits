'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';
import { AdminPageHeader, useAdminConfirm } from '../components';

interface Job {
    id: string;
    title: string;
    status: 'draft' | 'active' | 'paused' | 'closed' | 'filled';
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage?: number;
    created_at: string;
    updated_at: string;
    // Enriched
    company?: {
        id: string;
        name: string;
    };
    application_count?: number;
    recruiter_count?: number;
}

interface JobFilters {
    status?: Job['status'];
    company_id?: string;
}

export default function JobsAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const confirm = useAdminConfirm();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const defaultFilters = useMemo<JobFilters>(() => ({}), []);

    const {
        items: jobs,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Job, JobFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.status) queryParams.set('status', params.filters.status);
            if (params.filters?.company_id) queryParams.set('company_id', params.filters.company_id);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/jobs?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    async function updateJobStatus(jobId: string, newStatus: Job['status']) {
        const statusLabels: Record<string, string> = {
            active: 'reopen',
            closed: 'close',
            paused: 'pause',
        };
        const action = statusLabels[newStatus] || newStatus;

        const confirmed = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Job`,
            message: `Are you sure you want to ${action} this job?`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            type: newStatus === 'closed' ? 'warning' : 'info',
        });
        if (!confirmed) return;

        setUpdatingId(jobId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/jobs/${jobId}`, { status: newStatus });
            toast.success(`Job ${action}d successfully`);
            refresh();
        } catch (err) {
            console.error(`Failed to ${action} job:`, err);
            toast.error(`Failed to ${action} job`);
        } finally {
            setUpdatingId(null);
        }
    }

    function StatusBadge({ status }: { status: Job['status'] }) {
        const colors: Record<string, string> = {
            draft: 'badge-ghost',
            active: 'badge-success',
            paused: 'badge-warning',
            closed: 'badge-neutral',
            filled: 'badge-info',
        };
        return <span className={`badge ${colors[status] || 'badge-ghost'}`}>{status}</span>;
    }

    function formatSalary(min?: number, max?: number) {
        if (!min && !max) return '-';
        if (min && max) return `$${(min/1000).toFixed(0)}k - $${(max/1000).toFixed(0)}k`;
        if (min) return `$${(min/1000).toFixed(0)}k+`;
        return `Up to $${(max!/1000).toFixed(0)}k`;
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Job Management"
                subtitle="Manage all job postings across the platform"
                breadcrumbs={[{ label: 'Jobs' }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Jobs</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? '...' : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Active</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? '...' : jobs.filter(j => j.status === 'active').length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Paused</div>
                    <div className="stat-value text-2xl text-warning">
                        {loading ? '...' : jobs.filter(j => j.status === 'paused').length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Closed</div>
                    <div className="stat-value text-2xl text-base-content/50">
                        {loading ? '...' : jobs.filter(j => j.status === 'closed').length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Filled</div>
                    <div className="stat-value text-2xl text-info">
                        {loading ? '...' : jobs.filter(j => j.status === 'filled').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search jobs..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as JobFilters['status'] || undefined })}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                    <option value="filled">Filled</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading jobs..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : jobs.length === 0 ? (
                <EmptyState
                    icon="fa-briefcase"
                    title="No jobs found"
                    description={search || filters.status ? 'Try adjusting your search or filters' : 'Jobs will appear here once posted'}
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Salary</th>
                                        <th>Fee</th>
                                        <th>Status</th>
                                        <th>Applicants</th>
                                        <th>Recruiters</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job.id}>
                                            <td>
                                                <div className="font-semibold">{job.title}</div>
                                                <div className="text-xs text-base-content/50 font-mono">
                                                    {job.id.substring(0, 8)}...
                                                </div>
                                            </td>
                                            <td>
                                                {job.company ? (
                                                    <Link href={`/portal/admin/companies/${job.company.id}`} className="link link-hover text-sm">
                                                        {job.company.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-base-content/50">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm">{job.location || 'Remote'}</span>
                                            </td>
                                            <td>
                                                <span className="text-sm">{formatSalary(job.salary_min, job.salary_max)}</span>
                                            </td>
                                            <td>
                                                <span className="text-sm font-semibold">{job.fee_percentage ? `${job.fee_percentage}%` : '-'}</span>
                                            </td>
                                            <td>
                                                <StatusBadge status={job.status} />
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">{job.application_count ?? 0}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">{job.recruiter_count ?? 0}</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {job.status === 'active' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'paused')}
                                                                className="btn btn-xs btn-ghost text-warning"
                                                                disabled={updatingId === job.id}
                                                                title="Pause"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-pause"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => updateJobStatus(job.id, 'closed')}
                                                                className="btn btn-xs btn-ghost text-error"
                                                                disabled={updatingId === job.id}
                                                                title="Close"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-xmark"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    {(job.status === 'paused' || job.status === 'closed') && (
                                                        <button
                                                            onClick={() => updateJobStatus(job.id, 'active')}
                                                            className="btn btn-xs btn-ghost text-success"
                                                            disabled={updatingId === job.id}
                                                            title="Reopen"
                                                        >
                                                            {updatingId === job.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-play"></i>
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/portal/admin/jobs/${job.id}`}
                                                        className="btn btn-xs btn-ghost"
                                                        title="View details"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-eye"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && jobs.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
