"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface CallParticipant {
    user_id: string;
    role: string;
    name?: string;
}

interface CallListItem {
    id: string;
    title: string | null;
    call_type: string;
    scheduled_at: string;
    status: string;
    participants: CallParticipant[];
}

/* ─── Status Badge ───────────────────────────────────────────────────── */

function statusBadgeClass(status: string): string {
    switch (status) {
        case "scheduled":
            return "badge-info";
        case "in_progress":
            return "badge-warning";
        case "completed":
            return "badge-success";
        case "cancelled":
            return "badge-error";
        default:
            return "badge-ghost";
    }
}

function formatCallTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function isInFuture(dateStr: string): boolean {
    return new Date(dateStr).getTime() > Date.now();
}

function callDisplayTitle(call: CallListItem): string {
    if (call.title) return call.title;
    const names = call.participants
        ?.filter((p) => p.name)
        .map((p) => p.name)
        .slice(0, 2);
    if (names && names.length > 0) return `Call with ${names.join(", ")}`;
    return "Call";
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function ApplicationCallsSection({
    applicationId,
}: {
    applicationId: string;
}) {
    const { getToken } = useAuth();
    const [calls, setCalls] = useState<CallListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCalls = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: CallListItem[] }>("/calls", {
                params: {
                    entity_type: "application",
                    entity_id: applicationId,
                    sort_by: "scheduled_at",
                    sort_order: "desc",
                    limit: 10,
                },
            });
            setCalls(res.data || []);
        } catch (err) {
            console.error("[ApplicationCalls] Failed to load:", err);
            setCalls([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    useEffect(() => {
        fetchCalls();
    }, [fetchCalls]);

    if (loading) {
        return (
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Calls
                </h3>
                <div className="flex items-center justify-center py-6">
                    <span className="loading loading-spinner loading-sm" />
                </div>
            </div>
        );
    }

    if (calls.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                    Calls
                </h3>
                <div className="text-center py-6">
                    <i className="fa-duotone fa-regular fa-phone-slash text-2xl text-base-content/15 mb-2 block" />
                    <p className="text-sm text-base-content/40">No calls yet</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                Calls
            </h3>
            <div className="space-y-2">
                {calls.map((call) => (
                    <div
                        key={call.id}
                        className="flex items-center justify-between p-3 bg-base-200"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i className="fa-duotone fa-regular fa-phone text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {callDisplayTitle(call)}
                                </p>
                                <p className="text-sm text-base-content/60">
                                    {formatCallTime(call.scheduled_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                                className={`badge badge-sm ${statusBadgeClass(call.status)}`}
                            >
                                {call.status.replace(/_/g, " ")}
                            </span>
                            {call.status === "scheduled" &&
                                isInFuture(call.scheduled_at) && (
                                    <a
                                        href={`/portal/calls/${call.id}/join`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Join
                                    </a>
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
