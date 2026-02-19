"use client";

/**
 * Basel split list item — DaisyUI semantic tokens, sharp corners,
 * border-l-4 accent. No Memphis Badge or named colors.
 */

import { Presence } from "@/components/presense";
import {
    type ConversationRow,
    type ConversationContext,
    getOtherParticipant,
    formatMessageDate,
    getRequestStateDisplay,
} from "@/app/portal/messages/types";
import type { AccentClasses } from "./accent";

interface SplitItemProps {
    row: ConversationRow;
    isSelected: boolean;
    currentUserId: string | null;
    presenceStatus?: "online" | "idle" | "offline";
    onSelect: (id: string) => void;
    context?: ConversationContext | null;
    otherUserRole?: string | null;
    accent: AccentClasses;
}

export default function SplitItem({
    row,
    isSelected,
    currentUserId,
    presenceStatus,
    onSelect,
    context,
    otherUserRole,
    accent,
}: SplitItemProps) {
    const convo = row.conversation;
    const participant = row.participant;

    if (!convo || !participant) return null;

    const other = getOtherParticipant(convo, currentUserId);
    const name = other?.name || other?.email || "Unknown user";

    const contextLabel =
        context?.jobTitle && context?.companyName
            ? `${context.jobTitle} at ${context.companyName}`
            : context?.jobTitle || context?.companyName || null;
    const status = getRequestStateDisplay(row);

    /* Map status to DaisyUI badge classes */
    const statusBadgeClass =
        status.label === "Request"
            ? "badge-warning"
            : status.label === "Declined"
              ? "badge-error"
              : status.label === "Archived"
                ? "badge-ghost"
                : status.label === "Muted"
                  ? "badge-ghost"
                  : "badge-success";

    return (
        <div
            onClick={() => onSelect(convo.id)}
            className={`conv-item opacity-0 cursor-pointer p-4 transition-colors border-b border-base-300 border-l-4 ${
                isSelected
                    ? `${accent.bgLight} ${accent.border}`
                    : "bg-base-100 border-l-transparent hover:bg-base-200/50"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 text-left">
                            <span className="font-bold text-sm tracking-tight truncate text-base-content">
                                {name}
                            </span>
                            {otherUserRole && (
                                <span className="badge badge-outline badge-xs">{otherUserRole}</span>
                            )}
                        </div>
                        <Presence status={presenceStatus} variant="badge" />
                    </div>

                    {contextLabel && (
                        <div className={`text-sm font-semibold mb-1 truncate ${accent.text}`}>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {contextLabel}
                        </div>
                    )}

                    {context?.candidateName && (
                        <div className="text-xs text-start text-base-content/50 truncate mb-1">
                            <i className="fa-duotone fa-regular fa-user-shield mr-1" />
                            Re: {context.candidateName}
                        </div>
                    )}

                    <div className="text-xs text-start text-base-content/60">
                        {formatMessageDate(convo.last_message_at)}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className={`badge badge-sm ${statusBadgeClass}`}>
                        {status.label}
                    </span>
                    {participant.unread_count > 0 && (
                        <span className="badge badge-primary badge-sm">
                            {participant.unread_count > 99
                                ? "99+"
                                : participant.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
