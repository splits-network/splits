'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import RecruiterReputationBadge from '@/components/recruiter-reputation-badge';
import { useToast } from '@/lib/toast-context';
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';
import { AdminPageHeader } from '../components';

interface RecruiterReputation {
    recruiter_user_id: string;
    total_submissions: number;
    total_hires: number;
    total_completions: number;
    total_failures: number;
    hire_rate: number;
    completion_rate: number;
    avg_time_to_hire_days?: number;
    avg_response_time_hours?: number;
    quality_score?: number;
    recruiter_id?: string;
    total_placements?: number;
    completed_placements?: number;
    failed_placements?: number;
    total_collaborations?: number;
    collaboration_rate?: number;
    proposals_accepted?: number;
    proposals_declined?: number;
    proposals_timed_out?: number;
    reputation_score?: number;
    last_calculated_at?: string;
    created_at?: string;
    updated_at?: string;
}

interface Recruiter {
    id: string;
    user_id: string;
    status: 'pending' | 'active' | 'suspended';
    bio?: string;
    name?: string;
    email?: string;
    created_at: string;
    updated_at: string;
    // Enriched field (when backend supports include=reputation)
    reputation?: RecruiterReputation;
}

interface RecruiterFilters {
    status?: 'pending' | 'active' | 'suspended';
}

const defaultReputation: RecruiterReputation = {
    recruiter_user_id: '',
    total_submissions: 0,
    total_hires: 0,
    total_completions: 0,
    total_failures: 0,
    hire_rate: 0,
    completion_rate: 0,
    total_placements: 0,
    completed_placements: 0,
    failed_placements: 0,
    total_collaborations: 0,
    proposals_accepted: 0,
    proposals_declined: 0,
    proposals_timed_out: 0,
    reputation_score: 50.0,
};

export default function ReputationManagementClient() {
    const { getToken } = useAuth();
    const [sortBy, setSortBy] = useState<'reputation_score' | 'hire_rate' | 'completion_rate'>('reputation_score');
    const [refreshingId, setRefreshingId] = useState<string | null>(null);
    const toast = useToast();

    const defaultFilters = useMemo<RecruiterFilters>(() => ({ status: 'active' }), []);

    const {
        items: recruiters,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Recruiter, RecruiterFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.status) queryParams.set('status', params.filters.status);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            // TODO: Backend enhancement needed - add ?include=reputation to avoid N+1 queries
            const response = await apiClient.get(`/recruiters?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    // Sort recruiters by reputation score (client-side for current page)
    const sortedRecruiters = useMemo(() => {
        return [...recruiters].sort((a, b) => {
            const aRep = a.reputation || defaultReputation;
            const bRep = b.reputation || defaultReputation;
            const aValue = aRep[sortBy] || 0;
            const bValue = bRep[sortBy] || 0;
            return (bValue as number) - (aValue as number);
        });
    }, [recruiters, sortBy]);

    async function refreshReputation(recruiterId: string) {
        try {
            setRefreshingId(recruiterId);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            await client.post(`/recruiters/${recruiterId}/reputation/refresh`, {});
            toast.success('Reputation recalculated');
            await refresh();
        } catch (err: any) {
            console.error('Failed to refresh reputation:', err);
            toast.error('Failed to refresh reputation');
        } finally {
            setRefreshingId(null);
        }
    }

    // Calculate summary stats from current page
    const stats = useMemo(() => {
        const total = pagination.total || recruiters.length;
        const avgScore = recruiters.length > 0
            ? recruiters.reduce((sum, r) => sum + (r.reputation?.reputation_score ?? 50), 0) / recruiters.length
            : 0;
        const totalSubmissions = recruiters.reduce((sum, r) => sum + (r.reputation?.total_submissions ?? 0), 0);
        const totalHires = recruiters.reduce((sum, r) => sum + (r.reputation?.total_hires ?? 0), 0);
        const totalCollabs = recruiters.reduce((sum, r) => sum + (r.reputation?.total_collaborations ?? 0), 0);
        return { total, avgScore, totalSubmissions, totalHires, totalCollabs };
    }, [recruiters, pagination.total]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <AdminPageHeader
                title="Reputation Management"
                subtitle="Monitor recruiter performance and reputation scores"
                breadcrumbs={[{ label: 'Reputation' }]}
                actions={
                    <button onClick={refresh} className="btn btn-outline btn-sm">
                        <i className="fa-duotone fa-regular fa-rotate"></i>
                        Refresh All
                    </button>
                }
            />

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Recruiters</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? '...' : stats.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Avg Score</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? '...' : stats.avgScore.toFixed(1)}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Submissions</div>
                    <div className="stat-value text-2xl">
                        {loading ? '...' : stats.totalSubmissions}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Hires</div>
                    <div className="stat-value text-2xl">
                        {loading ? '...' : stats.totalHires}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Collaborations</div>
                    <div className="stat-value text-2xl">
                        {loading ? '...' : stats.totalCollabs}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search recruiters..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({
                        ...filters,
                        status: e.target.value as RecruiterFilters['status'] || undefined,
                    })}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                </select>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-base-content/70">Sort by:</span>
                    <select
                        className="select select-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    >
                        <option value="reputation_score">Overall Score</option>
                        <option value="hire_rate">Hire Rate</option>
                        <option value="completion_rate">Completion Rate</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading recruiters..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : recruiters.length === 0 ? (
                <EmptyState
                    icon="fa-star"
                    title="No recruiters found"
                    description={
                        search || filters.status
                            ? 'Try adjusting your search or filters'
                            : 'Recruiters will appear here once registered'
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Recruiter</th>
                                        <th>Overall Score</th>
                                        <th>Submissions</th>
                                        <th>Hire Rate</th>
                                        <th>Completion Rate</th>
                                        <th>Collaborations</th>
                                        <th>Response Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRecruiters.map((recruiter, index) => {
                                        const rep = recruiter.reputation || defaultReputation;
                                        return (
                                            <tr key={recruiter.id}>
                                                <td>
                                                    <div className="font-bold text-lg">#{index + 1}</div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {recruiter.name || `Recruiter ${recruiter.id.slice(0, 8)}`}
                                                        </div>
                                                        <div className="text-sm text-base-content/70 flex items-center gap-2">
                                                            <span className={`badge badge-xs ${recruiter.status === 'active' ? 'badge-success' : recruiter.status === 'pending' ? 'badge-warning' : 'badge-ghost'}`}>
                                                                {recruiter.status}
                                                            </span>
                                                            {recruiter.email && (
                                                                <span className="truncate max-w-[150px]">{recruiter.email}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <RecruiterReputationBadge reputation={rep} />
                                                </td>
                                                <td>
                                                    <div className="text-center">
                                                        <div className="font-semibold">{rep.total_submissions}</div>
                                                        <div className="text-xs text-base-content/70">
                                                            {rep.total_hires} hires
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-center">
                                                        {rep.hire_rate !== undefined
                                                            ? `${(rep.hire_rate * 100).toFixed(1)}%`
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-center">
                                                        <div className="font-semibold">
                                                            {rep.completion_rate !== undefined
                                                                ? `${(rep.completion_rate * 100).toFixed(1)}%`
                                                                : '-'}
                                                        </div>
                                                        <div className="text-xs text-base-content/70">
                                                            {rep.completed_placements}/{rep.total_placements}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-center">{rep.total_collaborations ?? 0}</div>
                                                </td>
                                                <td>
                                                    <div className="text-center">
                                                        {rep.avg_response_time_hours !== undefined
                                                            ? `${rep.avg_response_time_hours.toFixed(1)}h`
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => refreshReputation(recruiter.id)}
                                                            className="btn btn-xs btn-ghost"
                                                            title="Recalculate reputation"
                                                            disabled={refreshingId === recruiter.id}
                                                        >
                                                            {refreshingId === recruiter.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-rotate"></i>
                                                            )}
                                                        </button>
                                                        <button className="btn btn-xs btn-ghost" title="View details">
                                                            <i className="fa-duotone fa-regular fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && recruiters.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    setPage={setPage}
                />
            )}
        </div>
    );
}
