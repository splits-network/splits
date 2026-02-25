"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";

interface AuditLogEntry {
    id: string;
    placement_id: string;
    schedule_id?: string;
    transaction_id?: string;
    event_type: string;
    action?: string;
    old_status?: string;
    new_status?: string;
    old_amount?: number;
    new_amount?: number;
    reason?: string;
    metadata?: Record<string, any>;
    changed_by?: string;
    changed_by_role?: string;
    created_at: string;
}

interface AuditFilters {
    event_type?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
}

const ACTION_LABELS: Record<
    string,
    { label: string; color: string; icon: string }
> = {
    schedule_processing: {
        label: "Schedule Processing",
        color: "badge-info",
        icon: "fa-play",
    },
    schedule_completed: {
        label: "Schedule Completed",
        color: "badge-success",
        icon: "fa-check",
    },
    schedule_failed: {
        label: "Schedule Failed",
        color: "badge-error",
        icon: "fa-xmark",
    },
    create_schedule: {
        label: "Schedule Created",
        color: "badge-success",
        icon: "fa-plus",
    },
    update_schedule: {
        label: "Schedule Updated",
        color: "badge-info",
        icon: "fa-pen",
    },
    trigger_processing: {
        label: "Manual Trigger",
        color: "badge-warning",
        icon: "fa-play",
    },
    delete_schedule: {
        label: "Schedule Deleted",
        color: "badge-error",
        icon: "fa-trash",
    },
    transfer_processing: {
        label: "Transfer Processing",
        color: "badge-info",
        icon: "fa-arrow-right",
    },
    transfer_sent: {
        label: "Transfer Sent",
        color: "badge-success",
        icon: "fa-check",
    },
    transfer_failed: {
        label: "Transfer Failed",
        color: "badge-error",
        icon: "fa-xmark",
    },
    create_escrow_hold: {
        label: "Hold Created",
        color: "badge-success",
        icon: "fa-lock",
    },
    release_escrow_hold: {
        label: "Hold Released",
        color: "badge-success",
        icon: "fa-lock-open",
    },
    auto_release_escrow_hold: {
        label: "Auto-Released",
        color: "badge-success",
        icon: "fa-clock",
    },
    cancel_escrow_hold: {
        label: "Hold Cancelled",
        color: "badge-error",
        icon: "fa-xmark",
    },
    update_escrow_hold: {
        label: "Hold Updated",
        color: "badge-info",
        icon: "fa-pen",
    },
    delete_escrow_hold: {
        label: "Hold Deleted",
        color: "badge-error",
        icon: "fa-trash",
    },
};

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    processing: { label: "Processing", color: "badge-info" },
    completed: { label: "Completed", color: "badge-success" },
    failed: { label: "Failed", color: "badge-error" },
    action: { label: "Action", color: "badge-warning" },
};

export default function AuditLogPage() {
    const { getToken } = useAuth();
    const toast = useToast();
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
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.event_type)
                queryParams.set("event_type", params.filters.event_type);
            if (params.filters?.action)
                queryParams.set("action", params.filters.action);
            if (params.filters?.date_from)
                queryParams.set("date_from", params.filters.date_from);
            if (params.filters?.date_to)
                queryParams.set("date_to", params.filters.date_to);
            queryParams.set("sort_by", "created_at");
            queryParams.set("sort_order", "desc");

            const response = await apiClient.get(
                `/placement-payout-audit-log?${queryParams.toString()}`,
            );
            return response;
        },
        defaultFilters: {},
        syncToUrl: true,
    });

    function ActionBadge({ action }: { action: string }) {
        const config = ACTION_LABELS[action] || {
            label: action,
            color: "badge-ghost",
            icon: "fa-circle",
        };

        return (
            <span className={`badge ${config.color} gap-2`}>
                <i className={`fa-duotone fa-regular ${config.icon}`}></i>
                {config.label}
            </span>
        );
    }

    function EventTypeBadge({ eventType }: { eventType: string }) {
        const config = EVENT_TYPE_LABELS[eventType] || {
            label: eventType,
            color: "badge-ghost",
        };

        return <span className={`badge ${config.color}`}>{config.label}</span>;
    }

    function formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function truncateId(id: string): string {
        return id ? `${id.substring(0, 8)}...` : "N/A";
    }

    function toggleExpanded(entryId: string) {
        setExpandedEntry(expandedEntry === entryId ? null : entryId);
    }

    async function exportToCSV() {
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", "1");
            queryParams.set("limit", "10000");
            if (search) queryParams.set("search", search);
            if (filters.event_type) queryParams.set("event_type", filters.event_type);
            if (filters.action) queryParams.set("action", filters.action);
            if (filters.date_from) queryParams.set("date_from", filters.date_from);
            if (filters.date_to) queryParams.set("date_to", filters.date_to);
            queryParams.set("sort_by", "created_at");
            queryParams.set("sort_order", "desc");

            const response = await apiClient.get(
                `/placement-payout-audit-log?${queryParams.toString()}`,
            );
            const allEntries = response.data;

            const headers = [
                "Timestamp",
                "Event Type",
                "Action",
                "Placement ID",
                "Schedule ID",
                "Transaction ID",
                "Reason",
                "Actor",
                "Role",
                "Metadata",
            ];
            const rows = allEntries.map((entry: AuditLogEntry) => {
                const metadata = entry.metadata
                    ? `"${JSON.stringify(entry.metadata).replace(/"/g, '""')}"`
                    : "";

                return [
                    formatDateTime(entry.created_at),
                    entry.event_type,
                    entry.action || "",
                    entry.placement_id,
                    entry.schedule_id || "",
                    entry.transaction_id || "",
                    entry.reason || "",
                    entry.changed_by || "System",
                    entry.changed_by_role || "automated",
                    metadata,
                ].join(",");
            });

            const csvContent = [headers.join(","), ...rows].join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            const timestamp = new Date().toISOString().split("T")[0];
            link.setAttribute("download", `payout-audit-log-${timestamp}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(
                `Exported ${allEntries.length} audit log entries to CSV`,
            );
        } catch (error) {
            console.error("Failed to export audit log:", error);
            toast.error("Failed to export audit log");
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payout Audit Log</h1>
                    <p className="text-base-content/60 mt-1">
                        Track all changes and actions in the payout automation
                        system
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToCSV} className="btn btn-outline">
                        <i className="fa-duotone fa-regular fa-download"></i>
                        Export CSV
                    </button>
                    <Link
                        href="/portal/admin/payouts/schedules"
                        className="btn btn-ghost"
                    >
                        <i className="fa-duotone fa-regular fa-calendar"></i>
                        Schedules
                    </Link>
                    <Link
                        href="/portal/admin/payouts/escrow"
                        className="btn btn-ghost"
                    >
                        <i className="fa-duotone fa-regular fa-lock"></i>
                        Escrow Holds
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search audit log..."
                        />

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Event Type</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.event_type || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        event_type: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Types</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="action">Action</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Action</legend>
                            <select
                                className="select w-full md:w-48"
                                value={filters.action || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        action: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Actions</option>
                                <optgroup label="Schedules">
                                    <option value="schedule_processing">Schedule Processing</option>
                                    <option value="schedule_completed">Schedule Completed</option>
                                    <option value="schedule_failed">Schedule Failed</option>
                                    <option value="create_schedule">Schedule Created</option>
                                    <option value="trigger_processing">Manual Trigger</option>
                                </optgroup>
                                <optgroup label="Transfers">
                                    <option value="transfer_sent">Transfer Sent</option>
                                    <option value="transfer_failed">Transfer Failed</option>
                                </optgroup>
                                <optgroup label="Escrow Holds">
                                    <option value="create_escrow_hold">Hold Created</option>
                                    <option value="release_escrow_hold">Hold Released</option>
                                    <option value="auto_release_escrow_hold">Auto-Released</option>
                                    <option value="cancel_escrow_hold">Hold Cancelled</option>
                                </optgroup>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Date From</legend>
                            <input
                                type="date"
                                className="input w-full md:w-48"
                                value={filters.date_from || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        date_from: e.target.value,
                                    })
                                }
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Date To</legend>
                            <input
                                type="date"
                                className="input w-full md:w-48"
                                value={filters.date_to || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        date_to: e.target.value,
                                    })
                                }
                            />
                        </fieldset>

                        {(filters.event_type ||
                            filters.action ||
                            filters.date_from ||
                            filters.date_to ||
                            search) && (
                            <button
                                onClick={() => {
                                    setFilters({});
                                    setSearch("");
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
                                filters.action || filters.event_type || search
                                    ? "Try adjusting your filters"
                                    : "Audit entries will appear here as payouts are processed"
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
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
                                                <i
                                                    className={`fa-duotone fa-regular ${
                                                        ACTION_LABELS[entry.action || ""]?.icon || "fa-circle"
                                                    } text-sm`}
                                                ></i>
                                            </div>

                                            {/* Entry content */}
                                            <div className="flex-1 pb-6">
                                                <div className="card bg-base-200">
                                                    <div className="card-body p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                    <EventTypeBadge eventType={entry.event_type} />
                                                                    {entry.action && <ActionBadge action={entry.action} />}
                                                                    <span className="text-sm text-base-content/60">
                                                                        {formatDateTime(entry.created_at)}
                                                                    </span>
                                                                </div>

                                                                {/* Reference IDs */}
                                                                <div className="flex items-center gap-3 text-sm mb-2">
                                                                    <span className="text-base-content/60">
                                                                        Placement: <code className="text-base-content">{truncateId(entry.placement_id)}</code>
                                                                    </span>
                                                                    {entry.schedule_id && (
                                                                        <span className="text-base-content/60">
                                                                            Schedule: <code className="text-base-content">{truncateId(entry.schedule_id)}</code>
                                                                        </span>
                                                                    )}
                                                                    {entry.transaction_id && (
                                                                        <span className="text-base-content/60">
                                                                            Transaction: <code className="text-base-content">{truncateId(entry.transaction_id)}</code>
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {entry.reason && (
                                                                    <p className="text-sm text-base-content/80 mb-2">
                                                                        {entry.reason}
                                                                    </p>
                                                                )}

                                                                {(entry.changed_by || entry.changed_by_role) && (
                                                                    <div className="text-sm text-base-content/60">
                                                                        By: {entry.changed_by || "System"}{" "}
                                                                        ({entry.changed_by_role || "automated"})
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {entry.metadata && (
                                                                <button
                                                                    onClick={() => toggleExpanded(entry.id)}
                                                                    className="btn btn-sm btn-ghost"
                                                                >
                                                                    <i
                                                                        className={`fa-duotone fa-regular fa-chevron-${
                                                                            expandedEntry === entry.id ? "up" : "down"
                                                                        }`}
                                                                    ></i>
                                                                    Details
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Expanded details */}
                                                        {expandedEntry === entry.id && entry.metadata && (
                                                            <div className="mt-4 pt-4 border-t border-base-300 space-y-3">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-base-content/60 mb-1">
                                                                        Metadata:
                                                                    </h4>
                                                                    <pre className="bg-base-100 p-2 rounded text-sm overflow-x-auto">
                                                                        {JSON.stringify(entry.metadata, null, 2)}
                                                                    </pre>
                                                                </div>
                                                                <div className="text-sm text-base-content/60">
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
