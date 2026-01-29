'use client';

import { useState, useMemo, useEffect } from 'react';
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

interface Payout {
    id: string;
    placement_id: string;
    recruiter_id: string;
    payout_amount: number;
    placement_fee: number;
    recruiter_share_percentage: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold';
    created_at: string;
    processed_at?: string;
    // Enriched
    recruiter_name?: string;
}

interface PayoutFilters {
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold';
}

export default function PayoutsAdminPage() {
    const { getToken } = useAuth();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const toast = useToast();
    const [badgeCounts, setBadgeCounts] = useState({
        pending_schedules: 0,
        active_holds: 0,
        loading: true,
    });

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<PayoutFilters>(() => ({ status: 'pending' }), []);

    const {
        items: payouts,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Payout, PayoutFilters>({
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

            const response = await apiClient.get(`/payouts?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        syncToUrl: true,
    });

    // Load badge counts for navigation cards
    useEffect(() => {
        async function loadBadgeCounts() {
            try {
                const token = await getToken();
                if (!token) return;
                const apiClient = createAuthenticatedClient(token);

                // Load pending schedules count
                const schedulesResponse = await apiClient.get('/payout-schedules?status=pending&limit=1');
                const pendingSchedules = schedulesResponse.pagination?.total || 0;

                // Load active holds count
                const holdsResponse = await apiClient.get('/escrow-holds?status=active&limit=1');
                const activeHolds = holdsResponse.pagination?.total || 0;

                setBadgeCounts({
                    pending_schedules: pendingSchedules,
                    active_holds: activeHolds,
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to load badge counts:', error);
                setBadgeCounts({ pending_schedules: 0, active_holds: 0, loading: false });
            }
        }
        loadBadgeCounts();
    }, [getToken]);

    async function processPayout(payoutId: string) {
        if (!confirm('Process this payout? This will initiate a Stripe transfer.')) return;

        setProcessingId(payoutId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.post(`/payouts/${payoutId}/process`);
            toast.success('Payout processed successfully');
            refresh();
        } catch (error) {
            console.error('Failed to process payout:', error);
            toast.error('Failed to process payout');
        } finally {
            setProcessingId(null);
        }
    }

    // Status badge component
    function StatusBadge({ status }: { status: Payout['status'] }) {
        const colors: Record<string, string> = {
            pending: 'badge-warning',
            processing: 'badge-info',
            completed: 'badge-success',
            failed: 'badge-error',
            on_hold: 'badge-neutral',
        };
        return (
            <span className={`badge ${colors[status] || 'badge-neutral'} gap-1`}>
                {status === 'pending' && <i className="fa-duotone fa-regular fa-clock"></i>}
                {status === 'processing' && <i className="fa-duotone fa-regular fa-spinner fa-spin"></i>}
                {status === 'completed' && <i className="fa-duotone fa-regular fa-check"></i>}
                {status === 'failed' && <i className="fa-duotone fa-regular fa-xmark"></i>}
                {status === 'on_hold' && <i className="fa-duotone fa-regular fa-pause"></i>}
                {status}
            </span>
        );
    }

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'on_hold', label: 'On Hold' },
    ];

    // Calculate summary stats from loaded page
    const pendingCount = payouts.filter(p => p.status === 'pending').length;
    const processingCount = payouts.filter(p => p.status === 'processing').length;
    const completedCount = payouts.filter(p => p.status === 'completed').length;
    const totalAmount = payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.payout_amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
                    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                    Back to Admin Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Payout Management</h1>
                <p className="text-base-content/70 mt-1">
                    Process and track recruiter payouts
                </p>
            </div>

            {/* Automation Dashboard Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/portal/admin/payouts/schedules" className="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-calendar text-primary text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">Payout Schedules</h3>
                                    {!badgeCounts.loading && badgeCounts.pending_schedules > 0 && (
                                        <span className="badge badge-warning badge-sm">
                                            {badgeCounts.pending_schedules}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-base-content/60">Automated payout scheduling</p>
                            </div>
                            <i className="fa-duotone fa-regular fa-chevron-right text-base-content/40"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/portal/admin/payouts/escrow" className="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-lock text-warning text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">Escrow Holds</h3>
                                    {!badgeCounts.loading && badgeCounts.active_holds > 0 && (
                                        <span className="badge badge-warning badge-sm">
                                            {badgeCounts.active_holds}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-base-content/60">Guarantee period fund holds</p>
                            </div>
                            <i className="fa-duotone fa-regular fa-chevron-right text-base-content/40"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/portal/admin/payouts/audit" className="card bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-clock-rotate-left text-info text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Audit Log</h3>
                                <p className="text-sm text-base-content/60">Track all payout actions</p>
                            </div>
                            <i className="fa-duotone fa-regular fa-chevron-right text-base-content/40"></i>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Pending</div>
                    <div className="stat-value text-warning">
                        {loading ? '...' : pendingCount}
                    </div>
                    <div className="stat-desc">Awaiting processing</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Processing</div>
                    <div className="stat-value text-info">
                        {loading ? '...' : processingCount}
                    </div>
                    <div className="stat-desc">In progress</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Completed</div>
                    <div className="stat-value text-success">
                        {loading ? '...' : completedCount}
                    </div>
                    <div className="stat-desc">This page</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-lg">
                    <div className="stat-title">Total Paid</div>
                    <div className="stat-value text-2xl">
                        {loading ? '...' : `$${totalAmount.toLocaleString()}`}
                    </div>
                    <div className="stat-desc">This page</div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search payouts..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({
                        ...filters,
                        status: e.target.value as PayoutFilters['status'] || undefined
                    })}
                >
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : payouts.length === 0 ? (
                <EmptyState
                    icon="fa-duotone fa-regular fa-money-bill-wave"
                    title="No payouts found"
                    description={
                        search || filters.status
                            ? 'Try adjusting your search or filters'
                            : 'Payouts will appear here once placements are completed'
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Placement</th>
                                        <th>Recruiter</th>
                                        <th>Amount</th>
                                        <th>Fee</th>
                                        <th>Share %</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((payout) => (
                                        <tr key={payout.id}>
                                            <td>
                                                <span className="font-mono text-sm">
                                                    {payout.placement_id?.substring(0, 8) || '-'}...
                                                </span>
                                            </td>
                                            <td>
                                                {payout.recruiter_name || (
                                                    <span className="font-mono text-sm">
                                                        {payout.recruiter_id?.substring(0, 8) || '-'}...
                                                    </span>
                                                )}
                                            </td>
                                            <td className="font-semibold">
                                                ${(payout.payout_amount || 0).toLocaleString()}
                                            </td>
                                            <td>${(payout.placement_fee || 0).toLocaleString()}</td>
                                            <td>{payout.recruiter_share_percentage || 0}%</td>
                                            <td>
                                                <StatusBadge status={payout.status} />
                                            </td>
                                            <td>
                                                {new Date(payout.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {payout.status === 'pending' && (
                                                        <button
                                                            className="btn btn-primary btn-xs"
                                                            onClick={() => processPayout(payout.id)}
                                                            disabled={processingId === payout.id}
                                                        >
                                                            {processingId === payout.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <i className="fa-duotone fa-regular fa-play"></i>
                                                                    Process
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/admin/payouts/${payout.id}`}
                                                        className="btn btn-ghost btn-xs"
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

            {/* Pagination */}
            {!loading && !error && payouts.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    setPage={setPage}
                />
            )}
        </div>
    );
}
