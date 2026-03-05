"use client";

import { useUserProfile } from "@/contexts";
import type { AuditLogEntry } from "@splits-network/shared-ui";
import { interpretAuditLog } from "@splits-network/shared-ui";

interface ApplicationTimelineProps {
    auditLogs: AuditLogEntry[];
    currentStage: string;
}

const ROLE_BADGE: Record<string, string> = {
    system: "badge-ghost",
    candidate: "badge-info",
    recruiter: "badge-primary",
    company: "badge-secondary",
    hiring_manager: "badge-accent",
};

export default function ApplicationTimeline({ auditLogs, currentStage }: ApplicationTimelineProps) {
    const { isAdmin } = useUserProfile();

    if (!auditLogs || auditLogs.length === 0) {
        return (
            <div className="text-center py-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-timeline text-4xl mb-2 block" />
                <p>No activity yet</p>
            </div>
        );
    }

    // Sort newest first for the vertical timeline
    const sorted = [...auditLogs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const events = sorted.map((log) => ({
        ...interpretAuditLog(log),
        raw: log,
    }));

    return (
        <div className="space-y-0">
            {events.map((event, i) => (
                <div key={event.id} className="flex gap-4 pb-5 relative">
                    {i < events.length - 1 && (
                        <div className="absolute left-[14px] top-8 bottom-0 w-px bg-base-300" />
                    )}
                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${
                        event.color.includes("success") ? "bg-success text-success-content"
                        : event.color.includes("error") ? "bg-error text-error-content"
                        : event.color.includes("warning") ? "bg-warning text-warning-content"
                        : event.color.includes("accent") ? "bg-accent text-accent-content"
                        : "bg-primary text-primary-content"
                    }`}>
                        <i className={`fa-duotone fa-regular ${event.icon} text-xs`} />
                    </div>
                    <div className="pt-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold truncate">{event.label}</p>
                            {event.roleLabel && (
                                <span className={`badge badge-xs shrink-0 ${ROLE_BADGE[event.performedByRole || ""] || "badge-ghost"}`}>
                                    {event.roleLabel}
                                </span>
                            )}
                        </div>
                        {event.details && Object.keys(event.details).length > 0 && (
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                                {Object.entries(event.details).map(([key, value]) => (
                                    <span key={key} className="text-sm text-base-content/50">
                                        <span className="font-medium text-base-content/40">{key}:</span> {value}
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="text-sm text-base-content/30 mt-1">
                            {formatDateTime(event.timestamp)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }) + " " + date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}
