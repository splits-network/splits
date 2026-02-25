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
import { AdminPageHeader, useAdminConfirm } from '../components';

type TransactionStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'reversed' | 'on_hold';

interface PayoutTransaction {
    id: string;
    placement_split_id: string;
    placement_id: string;
    recruiter_id: string;
    amount: number;
    status: TransactionStatus;
    stripe_transfer_id?: string;
    stripe_payout_id?: string;
    stripe_connect_account_id?: string;
    created_at: string;
    updated_at: string;
    processing_started_at?: string;
    completed_at?: string;
    failed_at?: string;
    failure_reason?: string;
    retry_count: number;
}

interface TransactionFilters {
    status?: TransactionStatus;
}

export default function PayoutsAdminPage() {
    const { getToken } = useAuth();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const toast = useToast();
    const confirm = useAdminConfirm();
    const [badgeCounts, setBadgeCounts] = useState({
        pending_schedules: 0,
        active_holds: 0,
        loading: true,
    });

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<TransactionFilters>(() => ({ status: 'pending' }), []);

    const {
        items: transactions,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<PayoutTransaction, TransactionFilters>({
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

            const response = await apiClient.get(`/payout-transactions?${queryParams.toString()}`);
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

                // Load scheduled count
                const schedulesResponse = await apiClient.get('/payout-schedules?status=scheduled&limit=1');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function processTransaction(transactionId: string) {
        const confirmed = await confirm({
            title: 'Process Payout Transaction',
            message: 'This will initiate a Stripe transfer to the recruiter. Are you sure you want to proceed?',
            confirmText: 'Process',
            type: 'warning',
        });
        if (!confirmed) return;

        setProcessingId(transactionId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.post(`/payout-transactions/${transactionId}/process`);
            toast.success('Payout transaction processed successfully');
            refresh();
        } catch (error) {
            console.error('Failed to process payout transaction:', error);
            toast.error('Failed to process payout transaction');
        } finally {
            setProcessingId(null);
        }
    }

    // Status badge component
    function StatusBadge({ status }: { status: TransactionStatus }) {
        const colors: Record<string, string> = {
            pending: 'badge-warning',
            processing: 'badge-info',
            paid: 'badge-success',
            failed: 'badge-error',
            reversed: 'badge-neutral',
            on_hold: 'badge-neutral',
        };
        return (
            <span className={`badge ${colors[status] || 'badge-neutral'} gap-1`}>
                {status === 'pending' && <i className="fa-duotone fa-regular fa-clock"></i>}
                {status === 'processing' && <i className="fa-duotone fa-regular fa-spinner fa-spin"></i>}
                {status === 'paid' && <i className="fa-duotone fa-regular fa-check"></i>}
                {status === 'failed' && <i className="fa-duotone fa-regular fa-xmark"></i>}
                {status === 'reversed' && <i className="fa-duotone fa-regular fa-rotate-left"></i>}
                {status === 'on_hold' && <i className="fa-duotone fa-regular fa-pause"></i>}
                {status}
            </span>
        );
    }

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'reversed', label: 'Reversed' },
        { value: 'on_hold', label: 'On Hold' },
    ];

    // Calculate summary stats from loaded page
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    const processingCount = transactions.filter(t => t.status === 'processing').length;
    const paidCount = transactions.filter(t => t.status === 'paid').length;
    const totalAmount = transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <AdminPageHeader
                title="Payout Management"
                subtitle="Process and track recruiter payouts"
                breadcrumbs={[{ label: 'Payouts' }]}
            />

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
                    <div className="stat-title">Paid</div>
                    <div className="stat-value text-success">
                        {loading ? '...' : paidCount}
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
                    placeholder="Search transactions..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({
                        ...filters,
                        status: e.target.value as TransactionFilters['status'] || undefined
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
            ) : transactions.length === 0 ? (
                <EmptyState
                    icon="fa-duotone fa-regular fa-money-bill-wave"
                    title="No payout transactions found"
                    description={
                        search || filters.status
                            ? 'Try adjusting your search or filters'
                            : 'Payout transactions will appear here once placements are completed'
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
                                        <th>Status</th>
                                        <th>Retries</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn.id}>
                                            <td>
                                                <span className="font-mono text-sm">
                                                    {txn.placement_id?.substring(0, 8) || '-'}...
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-mono text-sm">
                                                    {txn.recruiter_id?.substring(0, 8) || '-'}...
                                                </span>
                                            </td>
                                            <td className="font-semibold">
                                                ${(txn.amount || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <StatusBadge status={txn.status} />
                                            </td>
                                            <td>
                                                {txn.retry_count > 0 ? (
                                                    <span className="badge badge-ghost badge-sm">{txn.retry_count}</span>
                                                ) : (
                                                    <span className="text-base-content/40">-</span>
                                                )}
                                            </td>
                                            <td>
                                                {new Date(txn.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {txn.status === 'pending' && (
                                                        <button
                                                            className="btn btn-primary btn-xs"
                                                            onClick={() => processTransaction(txn.id)}
                                                            disabled={processingId === txn.id}
                                                        >
                                                            {processingId === txn.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <i className="fa-duotone fa-regular fa-play"></i>
                                                                    Process
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {txn.failure_reason && (
                                                        <div className="tooltip" data-tip={txn.failure_reason}>
                                                            <button className="btn btn-ghost btn-xs text-error">
                                                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                                            </button>
                                                        </div>
                                                    )}
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
            {!loading && !error && transactions.length > 0 && (
                <PaginationControls
                    pagination={pagination}
                    setPage={setPage}
                />
            )}
        </div>
    );
}
