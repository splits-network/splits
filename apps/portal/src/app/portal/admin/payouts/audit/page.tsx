'use client';

import { useState, useMemo } from 'react';
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

interface AuditLogEntry {
    id: string;
    action: string;
    entity_type: 'payout_schedule' | 'escrow_hold';
    entity_id: string;
    changed_by?: string;
    changed_by_role?: string;
    before_state?: Record<string, any>;
    after_state?: Record<string, any>;
    metadata?: Record<string, any>;
    created_at: string;
}

interface AuditFilters {
    action?: string;
    entity_type?: AuditLogEntry['entity_type'];
    date_from?: string;
    date_to?: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    create_schedule: { label: 'Schedule Created', color: 'badge-success', icon: 'fa-plus' },
    update_schedule: { label: 'Schedule Updated', color: 'badge-info', icon: 'fa-pen' },
    trigger_processing: { label: 'Processing Triggered', color: 'badge-warning', icon: 'fa-play' },
    retry_schedule: { label: 'Schedule Retried', color: 'badge-warning', icon: 'fa-rotate' },
    cancel_schedule: { label: 'Schedule Cancelled', color: 'badge-error', icon: 'fa-xmark' },
    create_hold: { label: 'Hold Created', color: 'badge-success', icon: 'fa-lock' },
    release_hold: { label: 'Hold Released', color: 'badge-success', icon: 'fa-lock-open' },
    cancel_hold: { label: 'Hold Cancelled', color: 'badge-error', icon: 'fa-xmark' },
    process_batch: { label: 'Batch Processed', color: 'badge-info', icon: 'fa-list' },
};

export default function AuditLogPage() {
    const { getToken } = useAuth();
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

    const {
        items: entries,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<AuditLogEntry, AuditFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.action) queryParams.set('action', params.filters.action);
            if (params.filters?.entity_type) queryParams.set('entity_type', params.filters.entity_type);
            if (params.filters?.date_from) queryParams.set('date_from', params.filters.date_from);
            if (params.filters?.date_to) queryParams.set('date_to', params.filters.date_to);
            queryParams.set('sort_by', 'created_at');
            queryParams.set('sort_order', 'desc');

            const response = await apiClient.get(`/payout-audit-log?${queryParams.toString()}`);
            return response;
        },
        defaultFilters: {},
        syncToUrl: true,
    });

    function ActionBadge({ action }: { action: string }) {
        const config = ACTION_LABELS[action] || {
            label: action,
            color: 'badge-ghost',
            icon: 'fa-circle',
        };

        return (
            <span className={`badge ${config.color} gap-2`}>
                <i className={`fa-duotone fa-regular ${config.icon}`}></i>
                {config.label}
            </span>
        );
    }

    function formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getActionDescription(entry: AuditLogEntry): string {
        const config = ACTION_LABELS[entry.action];
        if (!config) return 'Action performed';

        // Build description from metadata
        let desc = config.label;
        if (entry.metadata?.payout_id) {
            desc += ` for payout ${entry.metadata.payout_id.substring(0, 8)}...`;
        }
        if (entry.metadata?.placement_id) {
            desc += ` on placement ${entry.metadata.placement_id.substring(0, 8)}...`;
        }

        return desc;
    }

    function toggleExpanded(entryId: string) {
        setExpandedEntry(expandedEntry === entryId ? null : entryId);
    }

    async function exportToCSV() {
        try {
            // Fetch all entries (without pagination) for export
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', '1');
            queryParams.set('limit', '10000'); // Get all entries
            if (search) queryParams.set('search', search);
            if (filters.action) queryParams.set('action', filters.action);
            if (filters.entity_type) queryParams.set('entity_type', filters.entity_type);
            if (filters.date_from) queryParams.set('date_from', filters.date_from);
            if (filters.date_to) queryParams.set('date_to', filters.date_to);
            queryParams.set('sort_by', 'created_at');
            queryParams.set('sort_order', 'desc');

            const response = await apiClient.get(`/payout-audit-log?${queryParams.toString()}`);
            const allEntries = response.data;

            // Create CSV content
            const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Actor', 'Role', 'Changes', 'Metadata'];
            const rows = allEntries.map((entry: AuditLogEntry) => {
                const changes = entry.before_state || entry.after_state
                    ? `"${JSON.stringify({ before: entry.before_state, after: entry.after_state }).replace(/"/g, '""')}"`
                    : '';
                const metadata = entry.metadata
                    ? `"${JSON.stringify(entry.metadata).replace(/"/g, '""')}"`
                    : '';

                return [
                    formatDateTime(entry.created_at),
                    ACTION_LABELS[entry.action]?.label || entry.action,
                    entry.entity_type,
                    entry.entity_id,
                    entry.changed_by || 'System',
                    entry.changed_by_role || 'N/A',
                    changes,
                    metadata,
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');

            // Download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const timestamp = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `payout-audit-log-${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`Exported ${allEntries.length} audit log entries to CSV`);
        } catch (error) {
            console.error('Failed to export audit log:', error);
            alert('Failed to export audit log');
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payout Audit Log</h1>
                    <p className="text-base-content/60 mt-1">
                        Track all changes and actions in the payout automation system
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToCSV} className="btn btn-outline">
                        <i className="fa-duotone fa-regular fa-download"></i>
                        Export CSV
                    </button>
                    <Link href="/portal/admin/payouts/schedules" className="btn btn-ghost">
                        <i className="fa-duotone fa-regular fa-calendar"></i>
                        Schedules
                    </Link>
                    <Link href="/portal/admin/payouts/escrow" className="btn btn-ghost">
                        <i className="fa-duotone fa-regular fa-lock"></i>
                        Escrow Holds
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search by entity ID..." />

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Action</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.action || ''}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            >
                                <option value="">All Actions</option>
                                <option value="create_schedule">Schedule Created</option>
                                <option value="update_schedule">Schedule Updated</option>
                                <option value="trigger_processing">Processing Triggered</option>
                                <option value="retry_schedule">Schedule Retried</option>
                                <option value="cancel_schedule">Schedule Cancelled</option>
                                <option value="create_hold">Hold Created</option>
                                <option value="release_hold">Hold Released</option>
                                <option value="cancel_hold">Hold Cancelled</option>
                                <option value="process_batch">Batch Processed</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Entity Type</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.entity_type || ''}
                                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value as any })}
                            >
                                <option value="">All Types</option>
                                <option value="payout_schedule">Payout Schedule</option>
                                <option value="escrow_hold">Escrow Hold</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Date From</legend>
                            <input
                                type="date"
                                className="input w-full md:w-48"
                                value={filters.date_from || ''}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Date To</legend>
                            <input
                                type="date"
                                className="input w-full md:w-48"
                                value={filters.date_to || ''}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                            />
                        </fieldset>

                        {(filters.action || filters.entity_type || filters.date_from || filters.date_to || search) && (
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

            {/* Audit Log Timeline */}
            <div className="card bg-base-100">
                <div className="card-body">
                    {loading ? (
                        <LoadingState message="Loading audit log..." />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : entries.length === 0 ? (
                        <EmptyState
                            icon="fa-clock-rotate-left"
                            title="No audit entries found"
                            description={
                                filters.action || search
                                    ? 'Try adjusting your filters'
                                    : 'Audit entries will appear here as actions are performed'
                            }
                        />
                    ) : (
                        <>
                            <div className="space-y-4">
                                {entries.map((entry, index) => (
                                    <div key={entry.id} className="relative">
                                        {/* Timeline connector */}
                                        {index < entries.length - 1 && (
                                            <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-base-300"></div>
                                        )}

                                        {/* Timeline entry */}
                                        <div className="flex gap-4">
                                            {/* Timeline dot */}
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-base-200 flex items-center justify-center z-10">
                                                <i
                                                    className={`fa-duotone fa-regular ${ACTION_LABELS[entry.action]?.icon || 'fa-circle'
                                                        } text-sm`}
                                                ></i>
                                            </div>

                                            {/* Entry content */}
                                            <div className="flex-1 pb-6">
                                                <div className="card bg-base-200">
                                                    <div className="card-body p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <ActionBadge action={entry.action} />
                                                                    <span className="badge badge-ghost">
                                                                        {entry.entity_type}
                                                                    </span>
                                                                    <span className="text-sm text-base-content/60">
                                                                        {formatDateTime(entry.created_at)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm mb-2">
                                                                    {getActionDescription(entry)}
                                                                </p>
                                                                {(entry.changed_by || entry.changed_by_role) && (
                                                                    <div className="text-xs text-base-content/60">
                                                                        By:{' '}
                                                                        {entry.changed_by || 'System'} (
                                                                        {entry.changed_by_role || 'automated'})
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {(entry.before_state ||
                                                                entry.after_state ||
                                                                entry.metadata) && (
                                                                    <button
                                                                        onClick={() => toggleExpanded(entry.id)}
                                                                        className="btn btn-sm btn-ghost"
                                                                    >
                                                                        <i
                                                                            className={`fa-duotone fa-regular fa-chevron-${expandedEntry === entry.id
                                                                                ? 'up'
                                                                                : 'down'
                                                                                }`}
                                                                        ></i>
                                                                        Details
                                                                    </button>
                                                                )}
                                                        </div>

                                                        {/* Expanded details */}
                                                        {expandedEntry === entry.id && (
                                                            <div className="mt-4 pt-4 border-t border-base-300 space-y-3">
                                                                {entry.before_state && (
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-base-content/60 mb-1">
                                                                            Before:
                                                                        </h4>
                                                                        <pre className="bg-base-100 p-2 rounded text-xs overflow-x-auto">
                                                                            {JSON.stringify(
                                                                                entry.before_state,
                                                                                null,
                                                                                2
                                                                            )}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {entry.after_state && (
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-base-content/60 mb-1">
                                                                            After:
                                                                        </h4>
                                                                        <pre className="bg-base-100 p-2 rounded text-xs overflow-x-auto">
                                                                            {JSON.stringify(
                                                                                entry.after_state,
                                                                                null,
                                                                                2
                                                                            )}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {entry.metadata && (
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-base-content/60 mb-1">
                                                                            Metadata:
                                                                        </h4>
                                                                        <pre className="bg-base-100 p-2 rounded text-xs overflow-x-auto">
                                                                            {JSON.stringify(
                                                                                entry.metadata,
                                                                                null,
                                                                                2
                                                                            )}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                <div className="text-xs text-base-content/60">
                                                                    Entry ID: {entry.id}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
