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

interface Placement {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id: string;
    salary: number;
    fee_percentage: number;
    fee_amount: number;
    recruiter_share_amount: number;
    start_date: string;
    created_at: string;
    // Enriched data
    job_title?: string;
    candidate_name?: string;
    recruiter_name?: string;
}

interface PlacementFilters {
    date_from?: string;
    date_to?: string;
}

export default function PlacementAuditPage() {
    const { getToken } = useAuth();

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<PlacementFilters>(() => ({}), []);

    const {
        items: placements,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Placement, PlacementFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.date_from) queryParams.set('date_from', params.filters.date_from);
            if (params.filters?.date_to) queryParams.set('date_to', params.filters.date_to);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/placements?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        syncToUrl: true,
    });

    // Calculate summary stats from loaded data
    const totalValue = placements.reduce((sum, p) => sum + (p.salary || 0), 0);
    const totalFees = placements.reduce((sum, p) => sum + (p.fee_amount || 0), 0);
    const totalRecruiterPayout = placements.reduce((sum, p) => sum + (p.recruiter_share_amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Admin Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Placement Audit</h1>
                <p className="text-base-content/70 mt-1">
                    Review all successful placements and payouts
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Total Placements</div>
                    <div className="stat-value text-primary">
                        {loading ? '...' : pagination.total}
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Page Value</div>
                    <div className="stat-value text-2xl">
                        {loading ? '...' : `$${(totalValue / 1000).toFixed(0)}k`}
                    </div>
                    <div className="stat-desc">Combined salaries (this page)</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Page Fees</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? '...' : `$${(totalFees / 1000).toFixed(0)}k`}
                    </div>
                    <div className="stat-desc">Platform revenue (this page)</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Recruiter Payouts</div>
                    <div className="stat-value text-2xl text-warning">
                        {loading ? '...' : `$${(totalRecruiterPayout / 1000).toFixed(0)}k`}
                    </div>
                    <div className="stat-desc">Total owed (this page)</div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search placements..."
                />
                <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">From:</label>
                    <input
                        type="date"
                        className="input input-sm"
                        value={filters.date_from || ''}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">To:</label>
                    <input
                        type="date"
                        className="input input-sm"
                        value={filters.date_to || ''}
                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : placements.length === 0 ? (
                <EmptyState
                    icon="fa-solid fa-trophy"
                    title="No placements found"
                    description={
                        search || filters.date_from || filters.date_to
                            ? 'Try adjusting your search or date filters'
                            : 'Placements will appear here once candidates are hired'
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Placement ID</th>
                                        <th>Start Date</th>
                                        <th>Salary</th>
                                        <th>Fee %</th>
                                        <th>Total Fee</th>
                                        <th>Recruiter Share</th>
                                        <th>Platform Share</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {placements.map((placement) => {
                                        const platformShare = (placement.fee_amount || 0) - (placement.recruiter_share_amount || 0);
                                        return (
                                            <tr key={placement.id}>
                                                <td>
                                                    <div className="font-mono text-xs">{placement.id.slice(0, 8)}</div>
                                                </td>
                                                <td>
                                                    {placement.start_date
                                                        ? new Date(placement.start_date).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="font-semibold">
                                                    ${(placement.salary || 0).toLocaleString()}
                                                </td>
                                                <td>{placement.fee_percentage || 0}%</td>
                                                <td className="text-success font-semibold">
                                                    ${(placement.fee_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="text-warning">
                                                    ${(placement.recruiter_share_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="text-info">
                                                    ${platformShare.toLocaleString()}
                                                </td>
                                                <td className="text-xs text-base-content/70">
                                                    {new Date(placement.created_at).toLocaleDateString()}
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
            {!loading && !error && placements.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    setPage={setPage}
                />
            )}

            {/* Export & Actions */}
            <div className="flex justify-end gap-2">
                <button className="btn btn-outline" disabled>
                    <i className="fa-solid fa-download"></i>
                    Export CSV
                </button>
                <button className="btn btn-outline" disabled>
                    <i className="fa-solid fa-file-pdf"></i>
                    Export PDF
                </button>
            </div>
        </div>
    );
}
