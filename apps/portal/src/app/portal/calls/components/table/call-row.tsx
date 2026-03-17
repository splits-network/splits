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

export function CallRow({ call }: { call: CallListItem }) {
    const title = call.title || participantNames(call.participants);
    const entityLabel = call.entity_links.length > 0
        ? `${call.entity_links[0].entity_type}`
        : null;

    return (
        <tr className="border-b border-base-300 hover:bg-base-200/50 transition-colors">
            {/* Title / Participants */}
            <td className="px-4 py-3">
                <Link
                    href={`/portal/calls/${call.id}`}
                    className="font-bold hover:text-primary transition-colors"
                >
                    {title}
                </Link>
                {call.title && (
                    <div className="text-sm text-base-content/50 mt-0.5">
                        {participantNames(call.participants)}
                    </div>
                )}
                {call.needs_follow_up && (
                    <span className="inline-flex items-center gap-1 text-sm text-warning mt-1">
                        <i className="fa-duotone fa-regular fa-flag" />
                        Follow-up needed
                    </span>
                )}
            </td>

            {/* Type */}
            <td className="px-4 py-3">
                <span className="text-sm">{formatCallType(call.call_type)}</span>
            </td>

            {/* Status */}
            <td className="px-4 py-3">
                <BaselBadge color={statusBadgeColor(call.status)}>
                    {formatCallStatus(call.status)}
                </BaselBadge>
            </td>

            {/* Date / Time */}
            <td className="px-4 py-3">
                <span className="text-sm">
                    {formatScheduledDate(call.scheduled_at || call.created_at)}
                </span>
            </td>

            {/* Duration (hidden on mobile) */}
            <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-sm">{formatDuration(call.duration_minutes)}</span>
            </td>

            {/* Entity (hidden on mobile) */}
            <td className="px-4 py-3 hidden md:table-cell">
                {entityLabel ? (
                    <span className="text-sm capitalize">{entityLabel}</span>
                ) : (
                    <span className="text-sm text-base-content/30">--</span>
                )}
            </td>

            {/* Tags (hidden on mobile) */}
            <td className="px-4 py-3 hidden md:table-cell">
                {call.tags && call.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {call.tags.map((tag) => (
                            <BaselBadge key={tag.tag_slug} color="neutral">
                                {tag.tag_slug}
                            </BaselBadge>
                        ))}
                    </div>
                ) : (
                    <span className="text-sm text-base-content/30">--</span>
                )}
            </td>
        </tr>
    );
}
