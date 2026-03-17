"use client";

import Link from "next/link";
import { BaselBadge } from "@splits-network/basel-ui";
import type { CallListItem } from "../../types";
import {
    formatCallType,
    formatCallStatus,
    statusBadgeColor,
    formatDuration,
    formatScheduledDate,
    participantNames,
} from "../../types";

export function CallCard({ call }: { call: CallListItem }) {
    const title = call.title || participantNames(call.participants);
    const isUpcoming = call.status === "scheduled";

    return (
        <Link href={`/portal/calls/${call.id}`}>
            <article
                className={[
                    "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-shadow hover:shadow-md p-4",
                    isUpcoming ? "border-l-primary" : "border-l-base-300",
                ].join(" ")}
            >
                {/* Header: Status + Type */}
                <div className="flex items-center justify-between mb-3">
                    <BaselBadge color={statusBadgeColor(call.status)}>
                        {formatCallStatus(call.status)}
                    </BaselBadge>
                    <span className="text-sm text-base-content/50">
                        {formatCallType(call.call_type)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors truncate">
                    {title}
                </h3>

                {/* Participants */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                        {call.participants.slice(0, 3).map((p) => (
                            <div
                                key={p.id}
                                className="w-7 h-7 bg-base-300 border-2 border-base-100 flex items-center justify-center text-sm font-bold"
                                title={p.user.name}
                            >
                                {p.user.name[0]}
                            </div>
                        ))}
                        {call.participants.length > 3 && (
                            <div className="w-7 h-7 bg-base-200 border-2 border-base-100 flex items-center justify-center text-sm">
                                +{call.participants.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-sm text-base-content/50 truncate">
                        {participantNames(call.participants)}
                    </span>
                </div>

                {/* Date & Duration */}
                <div className="flex items-center justify-between text-sm text-base-content/60">
                    <div className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar-clock" />
                        <span>
                            {formatScheduledDate(call.scheduled_at || call.created_at)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-clock" />
                        <span>{formatDuration(call.duration_minutes)}</span>
                    </div>
                </div>

                {/* Tags + Follow-up */}
                {((call.tags && call.tags.length > 0) || call.needs_follow_up) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-base-300">
                        {call.needs_follow_up && (
                            <BaselBadge color="warning">
                                <i className="fa-duotone fa-regular fa-flag mr-1" />
                                Follow-up
                            </BaselBadge>
                        )}
                        {call.tags?.map((tag) => (
                            <BaselBadge key={tag.tag_slug} color="neutral">
                                {tag.tag_slug}
                            </BaselBadge>
                        ))}
                    </div>
                )}

                {/* Entity links */}
                {call.entity_links.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-base-content/40">
                        <i className="fa-duotone fa-regular fa-link" />
                        <span className="capitalize">
                            {call.entity_links[0].entity_type}
                        </span>
                        {call.entity_links.length > 1 && (
                            <span>+{call.entity_links.length - 1} more</span>
                        )}
                    </div>
                )}
            </article>
        </Link>
    );
}
