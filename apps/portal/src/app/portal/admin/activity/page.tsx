'use client';

import { useMemo } from 'react';
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

interface ActivityLog {
    id: string;
    actor_id: string;
    actor_type: 'user' | 'system' | 'automation';
    action: string;
    entity_type: string;
    entity_id: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    // Enriched
    actor_name?: string;
    actor_email?: string;
    entity_name?: string;
}

interface ActivityFilters {
    entity_type?: string;
    action?: string;
    actor_type?: 'user' | 'system' | 'automation';
}

const ENTITY_TYPES = [
    'user',
    'recruiter',
    'company',
    'organization',
    'job',
    'candidate',
    'application',
    'placement',
    'payout',
    'escrow_hold',
    'fraud_signal',
    'automation_rule',
];

const ACTION_TYPES = [
    'create',
    'update',
    'delete',
    'approve',
    'reject',
    'suspend',
    'reactivate',
    'process',
    'release',
    'cancel',
];

export default function ActivityLogPage() {
    const { getToken } = useAuth();

    const defaultFilters = useMemo<ActivityFilters>(() => ({}), []);

    const {
        items: logs,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<ActivityLog, ActivityFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error('No auth token');
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set('page', String(params.page));
            queryParams.set('limit', String(params.limit));
            if (params.search) queryParams.set('search', params.search);
            if (params.filters?.entity_type) queryParams.set('entity_type', params.filters.entity_type);
            if (params.filters?.action) queryParams.set('action', params.filters.action);
            if (params.filters?.actor_type) queryParams.set('actor_type', params.filters.actor_type);
            if (params.sort_by) queryParams.set('sort_by', params.sort_by);
            if (params.sort_order) queryParams.set('sort_order', params.sort_order);

            const response = await apiClient.get(`/activity-logs?${queryParams.toString()}`);
            return response;
        },
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        syncToUrl: true,
    });

    function getActionIcon(action: string): string {
        const icons: Record<string, string> = {
            create: 'fa-plus',
            update: 'fa-pen',
            delete: 'fa-trash',
            approve: 'fa-check',
            reject: 'fa-xmark',
            suspend: 'fa-pause',
            reactivate: 'fa-play',
            process: 'fa-money-bill-transfer',
            release: 'fa-lock-open',
            cancel: 'fa-ban',
        };
        return icons[action] || 'fa-circle';
    }

    function getActionColor(action: string): string {
        const colors: Record<string, string> = {
            create: 'text-success',
            update: 'text-info',
            delete: 'text-error',
            approve: 'text-success',
            reject: 'text-error',
            suspend: 'text-warning',
            reactivate: 'text-success',
            process: 'text-success',
            release: 'text-info',
            cancel: 'text-error',
        };
        return colors[action] || 'text-base-content';
    }

    function getEntityIcon(entityType: string): string {
        const icons: Record<string, string> = {
            user: 'fa-user',
            recruiter: 'fa-user-tie',
            company: 'fa-building',
            organization: 'fa-users',
            job: 'fa-briefcase',
            candidate: 'fa-id-card',
            application: 'fa-file-lines',
            placement: 'fa-handshake',
            payout: 'fa-money-bill',
            escrow_hold: 'fa-lock',
            fraud_signal: 'fa-shield-exclamation',
            automation_rule: 'fa-robot',
        };
        return icons[entityType] || 'fa-circle';
    }

    function formatTimeAgo(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    function ActorBadge({ type }: { type: ActivityLog['actor_type'] }) {
        const styles: Record<string, string> = {
            user: 'badge-primary',
            system: 'badge-neutral',
            automation: 'badge-secondary',
        };
        return <span className={`badge badge-sm ${styles[type] || 'badge-ghost'}`}>{type}</span>;
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Activity Log"
                subtitle="Track all administrative actions across the platform"
                breadcrumbs={[{ label: 'Activity Log' }]}
            />

            {/* Filters */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Search by actor, entity..."
                            />
                        </div>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Entity Type</legend>
                            <select
                                className="select w-full md:w-40"
                                value={filters.entity_type || ''}
                                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value || undefined })}
                            >
                                <option value="">All Types</option>
                                {ENTITY_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Action</legend>
                            <select
                                className="select w-full md:w-40"
                                value={filters.action || ''}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
                            >
                                <option value="">All Actions</option>
                                {ACTION_TYPES.map((action) => (
                                    <option key={action} value={action}>
                                        {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Actor Type</legend>
                            <select
                                className="select w-full md:w-40"
                                value={filters.actor_type || ''}
                                onChange={(e) => setFilters({ ...filters, actor_type: e.target.value as ActivityFilters['actor_type'] || undefined })}
                            >
                                <option value="">All Actors</option>
                                <option value="user">User</option>
                                <option value="system">System</option>
                                <option value="automation">Automation</option>
                            </select>
                        </fieldset>
                        {(filters.entity_type || filters.action || filters.actor_type || search) && (
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

            {/* Activity List */}
            {loading ? (
                <LoadingState message="Loading activity logs..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : logs.length === 0 ? (
                <EmptyState
                    icon="fa-clock-rotate-left"
                    title="No activity logs found"
                    description={search || filters.entity_type || filters.action || filters.actor_type
                        ? 'Try adjusting your search or filters'
                        : 'Activity logs will appear here as actions are performed'}
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="divide-y divide-base-200">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-base-50">
                                    {/* Action Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-base-200 flex items-center justify-center ${getActionColor(log.action)}`}>
                                        <i className={`fa-duotone fa-regular ${getActionIcon(log.action)}`}></i>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">
                                                {log.actor_name || log.actor_email || (
                                                    log.actor_type === 'system' ? 'System' :
                                                    log.actor_type === 'automation' ? 'Automation' :
                                                    `User ${log.actor_id.substring(0, 8)}...`
                                                )}
                                            </span>
                                            <ActorBadge type={log.actor_type} />
                                            <span className="text-base-content/60">
                                                {log.action}d
                                            </span>
                                            <span className="badge badge-ghost badge-sm gap-1">
                                                <i className={`fa-duotone fa-regular ${getEntityIcon(log.entity_type)} text-xs`}></i>
                                                {log.entity_type.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {log.entity_name && (
                                            <div className="text-sm text-base-content/70 mt-1">
                                                {log.entity_name}
                                            </div>
                                        )}

                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <div className="text-xs text-base-content/50 mt-1 font-mono">
                                                {JSON.stringify(log.metadata).substring(0, 100)}
                                                {JSON.stringify(log.metadata).length > 100 && '...'}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-base-content/50 mt-2">
                                            <span>{formatTimeAgo(log.created_at)}</span>
                                            {log.ip_address && (
                                                <span className="font-mono">{log.ip_address}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-sm text-base-content/70">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-base-content/50">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && logs.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
