"use client";

import type { JobActivityItem, JobActivityType } from "../../types";
import { JOB_STATUS_LABELS } from "../../types";

/* ─── Icon Map ─────────────────────────────────────────────────────── */

const ACTIVITY_ICONS: Record<JobActivityType, string> = {
    job_created: "fa-duotone fa-regular fa-plus",
    job_status_changed: "fa-duotone fa-regular fa-arrows-rotate",
    job_fields_updated: "fa-duotone fa-regular fa-pencil",
    job_deleted: "fa-duotone fa-regular fa-trash",
    participant_added: "fa-duotone fa-regular fa-user-plus",
    participant_removed: "fa-duotone fa-regular fa-user-minus",
};

const ACTIVITY_COLORS: Record<JobActivityType, string> = {
    job_created: "text-success",
    job_status_changed: "text-info",
    job_fields_updated: "text-warning",
    job_deleted: "text-error",
    participant_added: "text-success",
    participant_removed: "text-error",
};

/* ─── Relative Time ────────────────────────────────────────────────── */

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

/* ─── Status Badge ─────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        draft: "badge-ghost", pending: "badge-warning", active: "badge-success",
        paused: "badge-warning", filled: "badge-info", closed: "badge-error",
    };
    return (
        <span className={`badge badge-sm ${colorMap[status] || "badge-ghost"}`}>
            {JOB_STATUS_LABELS[status] || status}
        </span>
    );
}

/* ─── Metadata Renderer ────────────────────────────────────────────── */

function ActivityMetadata({ item }: { item: JobActivityItem }) {
    const { activity_type, metadata } = item;

    if (activity_type === "job_status_changed" && metadata.previous_status && metadata.new_status) {
        return (
            <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={metadata.previous_status} />
                <i className="fa-solid fa-arrow-right text-base-content/30 text-sm" />
                <StatusBadge status={metadata.new_status} />
            </div>
        );
    }

    if (activity_type === "job_fields_updated" && metadata.changes) {
        const entries = Object.entries(metadata.changes) as [string, { old: any; new: any }][];
        if (entries.length === 0) return null;

        return (
            <div className="mt-1 space-y-0.5">
                {entries.slice(0, 5).map(([field, change]) => (
                    <div key={field} className="text-sm text-base-content/50">
                        <span className="font-medium capitalize">{field.replace(/_/g, " ")}</span>
                        {": "}
                        <span className="line-through text-base-content/30">{formatValue(change.old)}</span>
                        {" → "}
                        <span>{formatValue(change.new)}</span>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

function formatValue(val: any): string {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "number") return val.toLocaleString();
    return String(val);
}

/* ─── Timeline Item ────────────────────────────────────────────────── */

export function TimelineItem({ item }: { item: JobActivityItem }) {
    const icon = ACTIVITY_ICONS[item.activity_type] || "fa-duotone fa-regular fa-circle";
    const color = ACTIVITY_COLORS[item.activity_type] || "text-base-content/50";

    return (
        <li>
            <hr />
            <div className="timeline-middle px-2">
                <i className={`${icon} ${color}`} />
            </div>
            <div className="timeline-end timeline-box border-base-300 bg-base-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {item.actor_avatar_url ? (
                                <img
                                    src={item.actor_avatar_url}
                                    alt=""
                                    className="w-5 h-5 rounded-full"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-base-300 flex items-center justify-center">
                                    <i className="fa-solid fa-user text-base-content/30 text-[10px]" />
                                </div>
                            )}
                            <span className="text-sm font-medium truncate">
                                {item.actor_name || "System"}
                            </span>
                        </div>
                        <p className="text-sm text-base-content/70 mt-0.5">
                            {item.description}
                        </p>
                        <ActivityMetadata item={item} />
                    </div>
                    <time className="text-sm text-base-content/40 whitespace-nowrap">
                        {relativeTime(item.created_at)}
                    </time>
                </div>
            </div>
            <hr />
        </li>
    );
}
