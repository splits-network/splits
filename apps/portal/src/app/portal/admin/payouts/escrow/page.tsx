'use client';

import { useState, useMemo } from 'react';
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
import { ReleaseModal } from './components/release-modal';

interface EscrowHold {
    id: string;
    payout_id?: string;
    placement_id: string;
    hold_amount: number;
    holdback_percentage?: number;
    hold_reason: 'guarantee_period' | 'dispute' | 'verification' | 'other';
    release_date: string;
    status: 'active' | 'released' | 'cancelled';
    released_at?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
}

interface HoldFilters {
    status?: EscrowHold['status'];
    hold_reason?: EscrowHold['hold_reason'];
}

interface Stats {
    active_holds: number;
    total_held: number;
    due_for_release: number;
    released_today: number;
}

export default function EscrowHoldsPage() {
    const { getToken } = useAuth();
    const [releasingId, setReleasingId] = useState<string | null>(null);
    const [holdToRelease, setHoldToRelease] = useState<EscrowHold | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const toast = useToast();

    const defaultFilters = useMemo<HoldFilters>(() => ({ status: 'active' }), []);

    const {
        items: holds,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<EscrowHold, HoldFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.status) queryParams.set('status', params.filters.status);
            if (params.filters?.hold_reason) queryParams.set('hold_reason', params.filters.hold_reason);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/escrow-holds?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        syncToUrl: true,
    });

    // Load stats on mount
    useMemo(() => {
        async function loadStats() {
            try {
                const token = await getToken();
                if (!token) return;
                const apiClient = createAuthenticatedClient(token);

                // Get counts and totals
                const [active, released] = await Promise.all([
                    apiClient.get('/escrow-holds?status=active&limit=1'),
                    apiClient.get('/escrow-holds?status=released&limit=1'),
                ]);

                // Calculate total held amount (would need aggregation endpoint)
                const totalHeld = (active.data || []).reduce(
                    (sum: number, hold: EscrowHold) => sum + hold.hold_amount,
                    0
                );

                setStats({
                    active_holds: active.pagination?.total || 0,
                    total_held: totalHeld,
                    due_for_release: 0, // TODO: Add date filter
                    released_today: 0, // TODO: Add date filter
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoadingStats(false);
            }
        }
        loadStats();
    }, [getToken]);

    async function releaseHold(notes: string = '') {
        if (!holdToRelease) return;

        setReleasingId(holdToRelease.id);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.post(`/escrow-holds/${holdToRelease.id}/release`, {
                notes: notes || undefined,
            });
            toast.success('Escrow hold released successfully');
            refresh();
        } catch (error) {
            console.error('Failed to release hold:', error);
            toast.error('Failed to release hold');
            throw error; // Propagate to modal
        } finally {
            setReleasingId(null);
        }
    }

    function openReleaseModal(hold: EscrowHold) {
        setHoldToRelease(hold);
    }

    function closeReleaseModal() {
        setHoldToRelease(null);
    }

    async function cancelHold(holdId: string) {
        if (!confirm('Cancel this escrow hold? This action cannot be undone.')) return;

        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.post(`/escrow-holds/${holdId}/cancel`);
            toast.success('Escrow hold cancelled successfully');
            refresh();
        } catch (error) {
            console.error('Failed to cancel hold:', error);
            toast.error('Failed to cancel hold');
        }
    }

    function StatusBadge({ status }: { status: EscrowHold['status'] }) {
        const colors: Record<string, string> = {
            active: 'badge-warning',
            released: 'badge-success',
            cancelled: 'badge-neutral',
        };

        return <span className={`badge ${colors[status] || 'badge-neutral'}`}>{status}</span>;
    }

    function ReasonBadge({ reason }: { reason: EscrowHold['hold_reason'] }) {
        const labels: Record<string, string> = {
            guarantee_period: 'Guarantee Period',
            dispute: 'Dispute',
            verification: 'Verification',
            other: 'Other',
        };

        const colors: Record<string, string> = {
            guarantee_period: 'badge-info',
            dispute: 'badge-error',
            verification: 'badge-warning',
            other: 'badge-ghost',
        };

        return (
            <span className={`badge ${colors[reason] || 'badge-ghost'}`}>
                {labels[reason] || reason}
            </span>
        );
    }

    function isDueForRelease(releaseDate: string): boolean {
        return new Date(releaseDate) <= new Date();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Escrow Holds</h1>
                    <p className="text-base-content/60 mt-1">
                        Manage funds held in escrow during guarantee periods
                    </p>
                </div>
                <Link href="/portal/admin/payouts/schedules/audit" className="btn btn-ghost">
                    <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                    Audit Log
                </Link>
            </div>

            {/* Stats Cards */}
            {loadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card bg-base-200">
                            <div className="card-body">
                                <div className="skeleton h-4 w-20"></div>
                                <div className="skeleton h-8 w-16 mt-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Active Holds</h3>
                            <p className="text-3xl font-bold">{stats.active_holds}</p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Total Held</h3>
                            <p className="text-3xl font-bold">
                                ${stats.total_held.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Due for Release</h3>
                            <p className="text-3xl font-bold text-warning">
                                {stats.due_for_release}
                            </p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Released Today</h3>
                            <p className="text-3xl font-bold text-success">
                                {stats.released_today}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Filters & Search */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search holds..." />

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Status</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.status || ''}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="released">Released</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Reason</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.hold_reason || ''}
                                onChange={(e) => setFilters({ ...filters, hold_reason: e.target.value as any })}
                            >
                                <option value="">All Reasons</option>
                                <option value="guarantee_period">Guarantee Period</option>
                                <option value="dispute">Dispute</option>
                                <option value="verification">Verification</option>
                                <option value="other">Other</option>
                            </select>
                        </fieldset>

                        {(filters.status || filters.hold_reason || search) && (
                            <button
                                onClick={() => {
                                    setFilters({});
                                    setSearch('');
                                }}
                                className="btn btn-ghost"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Holds Table */}
            <div className="card bg-base-100">
                <div className="card-body">
                    {loading ? (
                        <LoadingState message="Loading escrow holds..." />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : holds.length === 0 ? (
                        <EmptyState
                            icon="fa-lock"
                            title="No escrow holds found"
                            description={
                                filters.status || search
                                    ? 'Try adjusting your filters'
                                    : 'Escrow holds will appear here when placements enter guarantee periods'
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Reason</th>
                                            <th>Amount</th>
                                            <th>Release Date</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holds.map((hold) => (
                                            <tr key={hold.id}>
                                                <td>
                                                    <StatusBadge status={hold.status} />
                                                </td>
                                                <td>
                                                    <ReasonBadge reason={hold.hold_reason} />
                                                </td>
                                                <td>
                                                    <span className="font-semibold">
                                                        ${hold.hold_amount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span
                                                            className={
                                                                hold.status === 'active' &&
                                                                    isDueForRelease(hold.release_date)
                                                                    ? 'text-warning font-semibold'
                                                                    : ''
                                                            }
                                                        >
                                                            {new Date(hold.release_date).toLocaleDateString()}
                                                        </span>
                                                        {hold.status === 'active' &&
                                                            isDueForRelease(hold.release_date) && (
                                                                <span className="badge badge-warning badge-xs mt-1">
                                                                    Due now
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-xs text-base-content/60">
                                                        {new Date(hold.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        {hold.status === 'active' && (
                                                            <>
                                                                <button
                                                                    onClick={() => openReleaseModal(hold)}
                                                                    disabled={releasingId === hold.id}
                                                                    className="btn btn-sm btn-success"
                                                                    title="Release hold"
                                                                >
                                                                    {releasingId === hold.id ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : (
                                                                        <i className="fa-duotone fa-regular fa-lock-open"></i>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => cancelHold(hold.id)}
                                                                    className="btn btn-sm btn-ghost"
                                                                    title="Cancel hold"
                                                                >
                                                                    <i className="fa-duotone fa-regular fa-xmark"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                        {hold.status === 'released' && hold.released_at && (
                                                            <span className="text-xs text-base-content/60">
                                                                Released{' '}
                                                                {new Date(hold.released_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {hold.status === 'cancelled' && hold.cancelled_at && (
                                                            <span className="text-xs text-base-content/60">
                                                                Cancelled{' '}
                                                                {new Date(hold.cancelled_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <PaginationControls
                                page={pagination.page}
                                totalPages={pagination.total_pages}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </div>
            </div>

            <ReleaseModal
                hold={holdToRelease}
                onClose={closeReleaseModal}
                onConfirm={releaseHold}
            />
        </div>
    );
}
