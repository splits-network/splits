import React from "react";
import { AuditLogEntry } from "./types";
import { interpretAuditLog } from "./smart-labels";

interface ActivityFeedProps {
    auditLogs: AuditLogEntry[];
    showDebugInfo?: boolean;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function ActivityFeed({
    auditLogs,
    showDebugInfo = false,
}: ActivityFeedProps) {
    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="text-center py-8 text-base-content/60">
                <i className="fa-duotone fa-regular fa-timeline text-4xl mb-2"></i>
                <p>No activity yet</p>
            </div>
        );
    }

    // Sort chronologically (oldest first)
    const sorted = [...auditLogs].sort(
        (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const events = sorted.map((log) => ({
        ...interpretAuditLog(log),
        raw: log,
    }));

    return (
        <ul className="timeline timeline-vertical timeline-compact">
            {events.map((event, index) => (
                <li key={event.id}>
                    {index > 0 && (
                        <hr
                            className={
                                event.color.includes("error")
                                    ? "bg-error"
                                    : event.color.includes("success")
                                      ? "bg-success"
                                      : "bg-primary"
                            }
                        />
                    )}
                    <div className="timeline-middle">
                        <div
                            className={`w-8 h-8 rounded-full bg-base-200 flex items-center justify-center ${event.color}`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${event.icon} text-sm`}
                            />
                        </div>
                    </div>
                    <div className="timeline-end timeline-box border-base-300 bg-base-100">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">
                                    {event.label}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-base-content/30">
                                        {new Date(
                                            event.timestamp,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            {event.roleLabel && (
                                <span
                                    className={`badge badge-xs shrink-0 ${
                                        event.performedByRole === "system"
                                            ? "badge-ghost"
                                            : event.performedByRole ===
                                                "candidate"
                                              ? "badge-info"
                                              : event.performedByRole ===
                                                  "recruiter"
                                                ? "badge-primary"
                                                : event.performedByRole ===
                                                    "company"
                                                  ? "badge-secondary"
                                                  : "badge-ghost"
                                    }`}
                                >
                                    {event.roleLabel}
                                </span>
                            )}
                        </div>

                        {/* Context details */}
                        {event.details && (
                            <div className="mt-2 space-y-1">
                                {Object.entries(event.details).map(
                                    ([key, value]) => (
                                        <div key={key} className="text-xs">
                                            <span className="font-medium text-base-content/60">
                                                {key}:
                                            </span>{" "}
                                            <span className="text-base-content/80">
                                                {value}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                        {/* Debug info for admins */}
                        {showDebugInfo && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-base-content/40 hover:text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-code" />{" "}
                                    Debug
                                </summary>
                                <pre className="mt-1 text-xs text-base-content/50 overflow-x-auto max-w-full">
                                    {JSON.stringify(
                                        {
                                            id: event.raw.id,
                                            action: event.raw.action,
                                            old_value: event.raw.old_value,
                                            new_value: event.raw.new_value,
                                            metadata: event.raw.metadata,
                                            performed_by:
                                                event.raw.performed_by_user_id,
                                        },
                                        null,
                                        2,
                                    )}
                                </pre>
                            </details>
                        )}
                    </div>
                    {index < events.length - 1 && (
                        <hr
                            className={
                                events[index + 1].color.includes("error")
                                    ? "bg-error"
                                    : events[index + 1].color.includes(
                                            "success",
                                        )
                                      ? "bg-success"
                                      : "bg-primary"
                            }
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}
