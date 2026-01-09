'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import {
    useStandardList,
    PaginationControls,
    ViewModeToggle,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';

interface Recruiter {
    id: string;
    user_id: string;
    status: 'pending' | 'active' | 'suspended';
    bio?: string;
    name?: string;
    email?: string;
    created_at: string;
}

interface RecruiterFilters {
    status?: 'pending' | 'active' | 'suspended';
}

export default function RecruiterManagementPage() {
    const { getToken } = useAuth();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<RecruiterFilters>(() => ({}), []);

    const {
        items: recruiters,
        loading,
        error,
        pagination,
        filters,
        search,
        viewMode,
        setSearch,
        setFilters,
        setPage,
        setViewMode,
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

            const response = await apiClient.get(`/recruiters?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        storageKey: 'adminRecruitersViewMode',
        syncToUrl: true,
    });

    async function updateRecruiterStatus(recruiterId: string, newStatus: 'active' | 'suspended' | 'pending') {
        setUpdatingId(recruiterId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.patch(`/recruiters/${recruiterId}/status`, { status: newStatus });
            refresh();
        } catch (error) {
            console.error('Failed to update recruiter status:', error);
            alert('Failed to update recruiter status');
        } finally {
            setUpdatingId(null);
        }
    }

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
    ];

    // Status badge component
    function StatusBadge({ status }: { status: Recruiter['status'] }) {
        if (status === 'pending') {
            return (
                <span className="badge badge-warning gap-1">
                    <i className="fa-duotone fa-regular fa-clock"></i>
                    Pending
                </span>
            );
        }
        if (status === 'active') {
            return (
                <span className="badge badge-success gap-1">
                    <i className="fa-duotone fa-regular fa-check"></i>
                    Active
                </span>
            );
        }
        if (status === 'suspended') {
            return (
                <span className="badge badge-error gap-1">
                    <i className="fa-duotone fa-regular fa-ban"></i>
                    Suspended
                </span>
            );
        }
        return null;
    }

    // Action buttons component
    function ActionButtons({ recruiter, size = 'sm' }: { recruiter: Recruiter; size?: 'xs' | 'sm' }) {
        const btnSize = size === 'xs' ? 'btn-xs' : 'btn-sm';
        const isUpdating = updatingId === recruiter.id;

        if (recruiter.status === 'pending') {
            return (
                <button
                    onClick={() => updateRecruiterStatus(recruiter.id, 'active')}
                    disabled={isUpdating}
                    className={`btn ${btnSize} btn-success`}
                >
                    {isUpdating ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-check"></i>
                            Approve
                        </>
                    )}
                </button>
            );
        }
        if (recruiter.status === 'active') {
            return (
                <button
                    onClick={() => updateRecruiterStatus(recruiter.id, 'suspended')}
                    disabled={isUpdating}
                    className={`btn ${btnSize} btn-error`}
                >
                    {isUpdating ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-ban"></i>
                            Suspend
                        </>
                    )}
                </button>
            );
        }
        if (recruiter.status === 'suspended') {
            return (
                <button
                    onClick={() => updateRecruiterStatus(recruiter.id, 'active')}
                    disabled={isUpdating}
                    className={`btn ${btnSize} btn-success`}
                >
                    {isUpdating ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-rotate-left"></i>
                            Reactivate
                        </>
                    )}
                </button>
            );
        }
        return null;
    }

    // Recruiter card component for grid view
    function RecruiterCard({ recruiter }: { recruiter: Recruiter }) {
        return (
            <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold">
                                {recruiter.name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-base-content/60">
                                {recruiter.email || recruiter.id.slice(0, 8)}
                            </p>
                        </div>
                        <StatusBadge status={recruiter.status} />
                    </div>
                    <p className="text-sm mt-2 min-h-[3rem] line-clamp-2">
                        {recruiter.bio || (
                            <span className="text-base-content/40 italic">No bio provided</span>
                        )}
                    </p>
                    <div className="text-xs text-base-content/60 mt-2">
                        Joined {new Date(recruiter.created_at).toLocaleDateString()}
                    </div>
                    <div className="card-actions justify-end mt-4">
                        <ActionButtons recruiter={recruiter} size="sm" />
                    </div>
                </div>
            </div>
        );
    }

    // Recruiter row component for table view
    function RecruiterRow({ recruiter }: { recruiter: Recruiter }) {
        return (
            <tr>
                <td>
                    <div>
                        <div className="font-medium">{recruiter.name || 'Unknown'}</div>
                        <div className="text-xs text-base-content/60">
                            {recruiter.email || recruiter.id.slice(0, 8)}
                        </div>
                    </div>
                </td>
                <td>
                    <StatusBadge status={recruiter.status} />
                </td>
                <td>
                    <div className="max-w-xs truncate">
                        {recruiter.bio || (
                            <span className="text-base-content/50">No bio</span>
                        )}
                    </div>
                </td>
                <td>{new Date(recruiter.created_at).toLocaleDateString()}</td>
                <td>
                    <ActionButtons recruiter={recruiter} size="xs" />
                </td>
            </tr>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                        Back to Admin Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Recruiter Management</h1>
                    <p className="text-base-content/70 mt-1">
                        Approve and manage platform recruiters
                    </p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
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
                            status: e.target.value as RecruiterFilters['status'] || undefined
                        })}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            {/* Content */}
            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : recruiters.length === 0 ? (
                <EmptyState
                    icon="fa-duotone fa-regular fa-users"
                    title="No recruiters found"
                    description={
                        search || filters.status
                            ? 'Try adjusting your search or filters'
                            : 'Recruiters will appear here once they sign up'
                    }
                />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recruiters.map((recruiter) => (
                        <RecruiterCard key={recruiter.id} recruiter={recruiter} />
                    ))}
                </div>
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Recruiter</th>
                                        <th>Status</th>
                                        <th>Bio</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recruiters.map((recruiter) => (
                                        <RecruiterRow key={recruiter.id} recruiter={recruiter} />
                                    ))}
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
