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

interface PayoutSchedule {
    id: string;
    payout_id?: string;
    placement_id?: string;
    trigger_event: 'manual' | 'guarantee_period_end' | 'milestone_reached' | 'contract_signed';
    scheduled_date: string;
    processed_at?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    retry_count: number;
    last_error?: string;
    created_at: string;
    updated_at: string;
}

interface ScheduleFilters {
    status?: PayoutSchedule['status'];
    trigger_event?: PayoutSchedule['trigger_event'];
}

interface Stats {
    pending: number;
    processed_today: number;
    failed: number;
    total_amount: number;
}

export default function PayoutSchedulesPage() {
    const { getToken } = useAuth();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const toast = useToast();

    const defaultFilters = useMemo<ScheduleFilters>(() => ({ status: 'pending' }), []);

    const {
        items: schedules,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<PayoutSchedule, ScheduleFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.status) queryParams.set('status', params.filters.status);
            if (params.filters?.trigger_event) queryParams.set('trigger_event', params.filters.trigger_event);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/payout-schedules?${queryParams.toString()}`);
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

                // Get counts for each status
                const [pending, failed] = await Promise.all([
                    apiClient.get('/payout-schedules?status=pending&limit=1'),
                    apiClient.get('/payout-schedules?status=failed&limit=1'),
                ]);

                setStats({
                    pending: pending.pagination?.total || 0,
                    processed_today: 0, // TODO: Add date filter for today
                    failed: failed.pagination?.total || 0,
                    total_amount: 0, // TODO: Calculate from payouts
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoadingStats(false);
            }
        }
        loadStats();
    }, [getToken]);

    async function triggerSchedule(scheduleId: string) {
        if (!confirm('Manually trigger this schedule? This will process it immediately.')) return;

        setProcessingId(scheduleId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.post(`/payout-schedules/${scheduleId}/trigger`);
            toast.success('Schedule triggered successfully');
            refresh();
        } catch (error) {
            console.error('Failed to trigger schedule:', error);
            toast.error('Failed to trigger schedule');
        } finally {
            setProcessingId(null);
        }
    }

    async function cancelSchedule(scheduleId: string) {
        if (!confirm('Cancel this schedule? This action cannot be undone.')) return;

        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.delete(`/payout-schedules/${scheduleId}`);
            toast.success('Schedule cancelled successfully');
            refresh();
        } catch (error) {
            console.error('Failed to cancel schedule:', error);
            toast.error('Failed to cancel schedule');
        }
    }

    async function retrySchedule(scheduleId: string) {
        if (!confirm('Retry this failed schedule? This will reset it to pending status.')) return;

        setProcessingId(scheduleId);
        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);
            await apiClient.patch(`/payout-schedules/${scheduleId}`, {
                status: 'pending',
                retry_count: 0,
            });
            toast.success('Schedule reset to pending');
            refresh();
        } catch (error) {
            console.error('Failed to retry schedule:', error);
            toast.error('Failed to retry schedule');
        } finally {
            setProcessingId(null);
        }
    }

    function StatusBadge({ status }: { status: PayoutSchedule['status'] }) {
        const colors: Record<string, string> = {
            pending: 'badge-warning',
            processing: 'badge-info',
            completed: 'badge-success',
            failed: 'badge-error',
            cancelled: 'badge-neutral',
        };

        return <span className={`badge ${colors[status] || 'badge-neutral'}`}>{status}</span>;
    }

    function TriggerEventBadge({ event }: { event: PayoutSchedule['trigger_event'] }) {
        const labels: Record<string, string> = {
            manual: 'Manual',
            guarantee_period_end: 'Guarantee End',
            milestone_reached: 'Milestone',
            contract_signed: 'Contract',
        };

        return <span className="badge badge-ghost">{labels[event] || event}</span>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payout Schedules</h1>
                    <p className="text-base-content/60 mt-1">
                        Automated payout processing schedules
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
                            <h3 className="text-sm text-base-content/60">Pending Schedules</h3>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Processed Today</h3>
                            <p className="text-3xl font-bold">{stats.processed_today}</p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Failed Schedules</h3>
                            <p className="text-3xl font-bold text-error">{stats.failed}</p>
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="text-sm text-base-content/60">Total Amount</h3>
                            <p className="text-3xl font-bold">
                                ${stats.total_amount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Filters & Search */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search schedules..." />

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Status</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.status || ''}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Trigger Event</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.trigger_event || ''}
                                onChange={(e) => setFilters({ ...filters, trigger_event: e.target.value as any })}
                            >
                                <option value="">All Events</option>
                                <option value="manual">Manual</option>
                                <option value="guarantee_period_end">Guarantee End</option>
                                <option value="milestone_reached">Milestone</option>
                                <option value="contract_signed">Contract</option>
                            </select>
                        </fieldset>

                        {(filters.status || filters.trigger_event || search) && (
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

            {/* Schedules Table */}
            <div className="card bg-base-100">
                <div className="card-body">
                    {loading ? (
                        <LoadingState message="Loading schedules..." />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : schedules.length === 0 ? (
                        <EmptyState
                            icon="fa-calendar-clock"
                            title="No schedules found"
                            description={
                                filters.status || search
                                    ? 'Try adjusting your filters'
                                    : 'Schedules will appear here when created automatically'
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Trigger Event</th>
                                            <th>Scheduled Date</th>
                                            <th>Retry Count</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map((schedule) => (
                                            <tr key={schedule.id}>
                                                <td>
                                                    <StatusBadge status={schedule.status} />
                                                </td>
                                                <td>
                                                    <TriggerEventBadge event={schedule.trigger_event} />
                                                </td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {new Date(schedule.scheduled_date).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-xs text-base-content/60">
                                                            {new Date(schedule.scheduled_date).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={
                                                            schedule.retry_count > 0
                                                                ? 'text-warning font-semibold'
                                                                : ''
                                                        }
                                                    >
                                                        {schedule.retry_count}
                                                    </span>
                                                    {schedule.retry_count >= 3 && (
                                                        <span className="badge badge-error badge-xs ml-2">
                                                            Max retries
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="text-xs text-base-content/60">
                                                        {new Date(schedule.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        {schedule.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => triggerSchedule(schedule.id)}
                                                                    disabled={processingId === schedule.id}
                                                                    className="btn btn-sm btn-primary"
                                                                    title="Trigger now"
                                                                >
                                                                    {processingId === schedule.id ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : (
                                                                        <i className="fa-duotone fa-regular fa-play"></i>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => cancelSchedule(schedule.id)}
                                                                    className="btn btn-sm btn-ghost"
                                                                    title="Cancel"
                                                                >
                                                                    <i className="fa-duotone fa-regular fa-xmark"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                        {schedule.status === 'failed' && (
                                                            <>
                                                                <button
                                                                    onClick={() => retrySchedule(schedule.id)}
                                                                    disabled={processingId === schedule.id}
                                                                    className="btn btn-sm btn-warning"
                                                                    title="Retry schedule"
                                                                >
                                                                    {processingId === schedule.id ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : (
                                                                        <i className="fa-duotone fa-regular fa-rotate"></i>
                                                                    )}
                                                                </button>
                                                                {schedule.last_error && (
                                                                    <div
                                                                        className="tooltip tooltip-left"
                                                                        data-tip={schedule.last_error}
                                                                    >
                                                                        <button className="btn btn-sm btn-ghost">
                                                                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error"></i>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {schedule.status === 'processing' && (
                                                            <span className="loading loading-spinner loading-sm text-info"></span>
                                                        )}
                                                        {(schedule.status === 'completed' ||
                                                            schedule.status === 'cancelled') && (
                                                                <span className="text-xs text-base-content/60">
                                                                    {schedule.processed_at
                                                                        ? new Date(
                                                                            schedule.processed_at
                                                                        ).toLocaleDateString()
                                                                        : 'N/A'}
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
        </div>
    );
}
