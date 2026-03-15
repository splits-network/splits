"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BaselBadge } from "@splits-network/basel-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { CallDetail } from "../../hooks/use-call-detail";
import {
    formatCallType,
    formatCallStatus,
    statusBadgeColor,
    formatDuration,
    formatScheduledDate,
} from "../../types";

interface CallDetailHeaderProps {
    call: CallDetail;
    onRefetch: () => void;
}

export function CallDetailHeader({ call, onRefetch }: CallDetailHeaderProps) {
    const { getToken } = useAuth();
    const [toggling, setToggling] = useState(false);

    const handleToggleFollowUp = async () => {
        try {
            setToggling(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.put(`/calls/${call.id}`, {
                needs_follow_up: !call.needs_follow_up,
            });
            onRefetch();
        } catch {
            // Non-critical
        } finally {
            setToggling(false);
        }
    };

    const isScheduled = call.status === "scheduled";
    const isActive = call.status === "active";

    return (
        <div className="border-b-2 border-base-300 bg-base-100 p-6">
            {/* Breadcrumb */}
            <div className="text-sm breadcrumbs mb-4">
                <ul>
                    <li>
                        <a href="/portal/calls">Calls</a>
                    </li>
                    <li>{call.title || "Call Detail"}</li>
                </ul>
            </div>

            {/* Title Row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-black tracking-tight mb-2">
                        {call.title || "Untitled Call"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <BaselBadge color={statusBadgeColor(call.status)}>
                            {formatCallStatus(call.status)}
                        </BaselBadge>
                        <BaselBadge color="neutral">
                            {formatCallType(call.call_type)}
                        </BaselBadge>
                        {call.tags?.map((tag) => (
                            <BaselBadge key={tag.tag_slug} color="neutral">
                                {tag.tag_slug}
                            </BaselBadge>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        className={`btn btn-sm ${call.needs_follow_up ? "btn-warning" : "btn-ghost"}`}
                        style={{ borderRadius: 0 }}
                        onClick={handleToggleFollowUp}
                        disabled={toggling}
                    >
                        <i className="fa-duotone fa-regular fa-flag" />
                        {call.needs_follow_up ? "Follow-up Set" : "Flag Follow-up"}
                    </button>
                    {(isScheduled || isActive) && (
                        <a
                            href={`/portal/calls/${call.id}/join`}
                            className="btn btn-sm btn-primary"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-video" />
                            {isActive ? "Join Call" : "Join When Ready"}
                        </a>
                    )}
                </div>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-base-content/60">
                <span className="inline-flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-calendar" />
                    {formatScheduledDate(call.scheduled_at || call.created_at)}
                </span>
                {call.duration_minutes !== null && (
                    <span className="inline-flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-clock" />
                        {formatDuration(call.duration_minutes)}
                    </span>
                )}
                {call.duration_minutes_planned && (
                    <span className="inline-flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-hourglass" />
                        Planned: {call.duration_minutes_planned}m
                    </span>
                )}
                <span className="inline-flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-users" />
                    {call.participants.length} participant{call.participants.length !== 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
}
