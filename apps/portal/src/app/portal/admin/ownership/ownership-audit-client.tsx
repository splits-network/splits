'use client';

import { useState, useEffect, useMemo } from 'react';
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

interface CandidateSourcer {
    id: string;
    candidate_id: string;
    sourcer_user_id: string;
    sourcer_type: 'recruiter' | 'tsn';
    sourced_at: string;
    protection_window_days: number;
    protection_expires_at: string;
    notes?: string;
    created_at: string;
    // Enriched fields (when backend supports include=candidate)
    candidate?: {
        id: string;
        email: string;
        full_name: string;
        linkedin_url?: string;
    };
}

interface OwnershipFilters {
    protection_status?: 'active' | 'expired';
    sourcer_type?: 'recruiter' | 'tsn';
}

function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
}

function getDaysRemaining(expiresAt: string): number {
    const now = new Date();
    const expires = new Date(expiresAt);
    if (expires < now) return 0;
    return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function OwnershipAuditClient() {
    const { getToken } = useAuth();
    const defaultFilters = useMemo<OwnershipFilters>(() => ({}), []);

    const {
        items: sourcers,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<CandidateSourcer, OwnershipFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.protection_status) {
                queryParams.set('protection_status', params.filters.protection_status);
            }
            if (params.filters?.sourcer_type) {
                queryParams.set('sourcer_type', params.filters.sourcer_type);
            }
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            // TODO: Backend enhancement needed - add ?include=candidate to avoid N+1 queries
            // Currently the endpoint returns sourcers without candidate data
            const response = await apiClient.get(`/candidates/sourcers?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    // Calculate stats from current page (backend should provide platform totals)
    const stats = useMemo(() => {
        const total = pagination.total || sourcers.length;
        const active = sourcers.filter(s => !isExpired(s.protection_expires_at)).length;
        const expired = sourcers.filter(s => isExpired(s.protection_expires_at)).length;
        const tsnSourced = sourcers.filter(s => s.sourcer_type === 'tsn').length;
        return { total, active, expired, tsnSourced };
    }, [sourcers, pagination.total]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <AdminPageHeader
                title="Ownership Audit"
                subtitle="Review candidate sourcing and ownership protection windows"
                breadcrumbs={[{ label: 'Ownership Audit' }]}
                actions={
                    <button onClick={refresh} className="btn btn-outline btn-sm">
                        <i className="fa-duotone fa-regular fa-rotate"></i>
                        Refresh
                    </button>
                }
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Ownerships</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? '...' : stats.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Active Protections</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? '...' : stats.active}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Expired</div>
                    <div className="stat-value text-2xl text-base-content/50">
                        {loading ? '...' : stats.expired}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">TSN Sourced</div>
                    <div className="stat-value text-2xl text-accent">
                        {loading ? '...' : stats.tsnSourced}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by candidate name or email..."
                />
                <select
                    className="select select-sm"
                    value={filters.protection_status || ''}
                    onChange={(e) => setFilters({
                        ...filters,
                        protection_status: e.target.value as OwnershipFilters['protection_status'] || undefined,
                    })}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                </select>
                <select
                    className="select select-sm"
                    value={filters.sourcer_type || ''}
                    onChange={(e) => setFilters({
                        ...filters,
                        sourcer_type: e.target.value as OwnershipFilters['sourcer_type'] || undefined,
                    })}
                >
                    <option value="">All Sourcer Types</option>
                    <option value="tsn">TSN</option>
                    <option value="recruiter">Recruiter</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading ownership records..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : sourcers.length === 0 ? (
                <EmptyState
                    icon="fa-shield-halved"
                    title="No ownership records found"
                    description={
                        search || filters.protection_status || filters.sourcer_type
                            ? 'Try adjusting your search or filters'
                            : 'Ownership records will appear when candidates are sourced'
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Sourcer Type</th>
                                        <th>Sourced Date</th>
                                        <th>Protection Status</th>
                                        <th>Expires</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sourcers.map((sourcer) => {
                                        const expired = isExpired(sourcer.protection_expires_at);
                                        const daysRemaining = getDaysRemaining(sourcer.protection_expires_at);

                                        return (
                                            <tr key={sourcer.id}>
                                                <td>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {sourcer.candidate?.full_name || (
                                                                <span className="text-base-content/50 font-mono text-sm">
                                                                    {sourcer.candidate_id.substring(0, 8)}...
                                                                </span>
                                                            )}
                                                        </div>
                                                        {sourcer.candidate?.email && (
                                                            <div className="text-sm text-base-content/70">
                                                                {sourcer.candidate.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${sourcer.sourcer_type === 'tsn' ? 'badge-primary' : 'badge-neutral'}`}>
                                                        {sourcer.sourcer_type === 'tsn' ? 'TSN' : 'Recruiter'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-sm">
                                                        {new Date(sourcer.sourced_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    {expired ? (
                                                        <span className="badge badge-ghost">
                                                            <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-success">
                                                            <i className="fa-duotone fa-regular fa-shield-halved mr-1"></i>
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="text-sm">
                                                        {new Date(sourcer.protection_expires_at).toLocaleDateString()}
                                                        {!expired && daysRemaining > 0 && (
                                                            <div className="text-xs text-base-content/70">
                                                                {daysRemaining} days remaining
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-sm text-base-content/70 max-w-xs truncate">
                                                        {sourcer.notes || '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-ghost">
                                                        <i className="fa-duotone fa-regular fa-eye"></i>
                                                        View
                                                    </button>
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
            {!loading && !error && sourcers.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    setPage={setPage}
                />
            )}
        </div>
    );
}
