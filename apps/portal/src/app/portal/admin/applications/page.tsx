'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';
import { AdminPageHeader } from '../components';

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id?: string;
    stage: 'submitted' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
    status: 'active' | 'archived';
    submitted_at: string;
    created_at: string;
    updated_at: string;
    // Enriched
    job?: {
        id: string;
        title: string;
    };
    candidate?: {
        id: string;
        full_name?: string;
        email: string;
    };
    company?: {
        id: string;
        name: string;
    };
    recruiter_name?: string;
}

interface ApplicationFilters {
    stage?: Application['stage'];
    status?: 'active' | 'archived';
}

export default function ApplicationsAdminPage() {
    const { getToken } = useAuth();

    const defaultFilters = useMemo<ApplicationFilters>(() => ({}), []);

    const {
        items: applications,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Application, ApplicationFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.stage) queryParams.set('stage', params.filters.stage);
            if (params.filters?.status) queryParams.set('status', params.filters.status);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/applications?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    function StageBadge({ stage }: { stage: Application['stage'] }) {
        const colors: Record<string, string> = {
            submitted: 'badge-neutral',
            screening: 'badge-info',
            interview: 'badge-warning',
            offer: 'badge-accent',
            hired: 'badge-success',
            rejected: 'badge-error',
            withdrawn: 'badge-ghost',
        };
        const icons: Record<string, string> = {
            submitted: 'fa-inbox',
            screening: 'fa-magnifying-glass',
            interview: 'fa-comments',
            offer: 'fa-file-signature',
            hired: 'fa-check',
            rejected: 'fa-xmark',
            withdrawn: 'fa-arrow-left',
        };
        return (
            <span className={`badge ${colors[stage] || 'badge-ghost'} gap-1`}>
                <i className={`fa-duotone fa-regular ${icons[stage]} text-xs`}></i>
                {stage}
            </span>
        );
    }

    // Calculate stage counts
    const stageCounts = useMemo(() => {
        const counts: Record<string, number> = {
            submitted: 0,
            screening: 0,
            interview: 0,
            offer: 0,
            hired: 0,
            rejected: 0,
        };
        applications.forEach(app => {
            if (counts[app.stage] !== undefined) {
                counts[app.stage]++;
            }
        });
        return counts;
    }, [applications]);

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Application Oversight"
                subtitle="Monitor all applications across the platform"
                breadcrumbs={[{ label: 'Applications' }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-xs">Submitted</div>
                    <div className="stat-value text-xl text-neutral">
                        {loading ? '...' : stageCounts.submitted}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-xs">Screening</div>
                    <div className="stat-value text-xl text-info">
                        {loading ? '...' : stageCounts.screening}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-xs">Interview</div>
                    <div className="stat-value text-xl text-warning">
                        {loading ? '...' : stageCounts.interview}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-xs">Offer</div>
                    <div className="stat-value text-xl text-accent">
                        {loading ? '...' : stageCounts.offer}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-xs">Hired</div>
                    <div className="stat-value text-xl text-success">
                        {loading ? '...' : stageCounts.hired}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-xs">Rejected</div>
                    <div className="stat-value text-xl text-error">
                        {loading ? '...' : stageCounts.rejected}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search applications..."
                />
                <select
                    className="select select-sm"
                    value={filters.stage || ''}
                    onChange={(e) => setFilters({ ...filters, stage: e.target.value as ApplicationFilters['stage'] || undefined })}
                >
                    <option value="">All Stages</option>
                    <option value="submitted">Submitted</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                </select>
                <select
                    className="select select-sm"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as ApplicationFilters['status'] || undefined })}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading applications..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : applications.length === 0 ? (
                <EmptyState
                    icon="fa-file-lines"
                    title="No applications found"
                    description={search || filters.stage || filters.status ? 'Try adjusting your search or filters' : 'Applications will appear here once submitted'}
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Recruiter</th>
                                        <th>Stage</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id}>
                                            <td>
                                                {app.candidate ? (
                                                    <div>
                                                        <div className="font-semibold">
                                                            {app.candidate.full_name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-base-content/50">
                                                            {app.candidate.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-sm text-base-content/50">
                                                        {app.candidate_id.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {app.job ? (
                                                    <Link href={`/portal/admin/jobs/${app.job.id}`} className="link link-hover text-sm">
                                                        {app.job.title}
                                                    </Link>
                                                ) : (
                                                    <span className="font-mono text-sm text-base-content/50">
                                                        {app.job_id.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {app.company ? (
                                                    <span className="text-sm">{app.company.name}</span>
                                                ) : (
                                                    <span className="text-base-content/50">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm">{app.recruiter_name || '-'}</span>
                                            </td>
                                            <td>
                                                <StageBadge stage={app.stage} />
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm ${app.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/portal/admin/applications/${app.id}`}
                                                    className="btn btn-xs btn-ghost"
                                                    title="View details"
                                                >
                                                    <i className="fa-duotone fa-regular fa-eye"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && applications.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
