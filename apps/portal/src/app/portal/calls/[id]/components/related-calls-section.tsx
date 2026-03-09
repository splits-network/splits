"use client";

import Link from "next/link";
import { BaselBadge } from "@splits-network/basel-ui";
import type { CallListItem, CallEntityLink } from "../../types";
import {
    formatCallType,
    formatCallStatus,
    statusBadgeColor,
    formatScheduledDate,
    participantNames,
} from "../../types";

interface RelatedCallsSectionProps {
    calls: CallListItem[];
    currentCallId: string;
    entityLink: CallEntityLink | null;
}

export function RelatedCallsSection({
    calls,
    currentCallId,
    entityLink,
}: RelatedCallsSectionProps) {
    if (calls.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-[0.15em]">
                    <i className="fa-duotone fa-regular fa-link mr-2 text-base-content/40" />
                    Related Calls ({calls.length})
                </h3>
                {entityLink && (
                    <Link
                        href={`/portal/calls?entity_type=${entityLink.entity_type}&entity_id=${entityLink.entity_id}`}
                        className="text-sm text-primary hover:underline"
                    >
                        View all
                    </Link>
                )}
            </div>

            <div className="border-2 border-base-300 divide-y divide-base-300">
                {calls.map((call) => (
                    <Link
                        key={call.id}
                        href={`/portal/calls/${call.id}`}
                        className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-base-200/50 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">
                                {call.title || participantNames(call.participants)}
                            </p>
                            <p className="text-sm text-base-content/40">
                                {formatCallType(call.call_type)} &middot;{" "}
                                {formatScheduledDate(
                                    call.scheduled_at || call.created_at
                                )}
                            </p>
                        </div>
                        <BaselBadge color={statusBadgeColor(call.status)}>
                            {formatCallStatus(call.status)}
                        </BaselBadge>
                    </Link>
                ))}
            </div>
        </div>
    );
}
