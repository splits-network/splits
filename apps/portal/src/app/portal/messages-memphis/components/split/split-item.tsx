"use client";

import { Presence } from "@/components/presense";
import { Badge } from "@splits-network/memphis-ui";
import {
    type ConversationRow,
    type ConversationContext,
    getOtherParticipant,
    formatMessageDate,
    getRequestStateDisplay,
} from "../../types";
import type { AccentClasses } from "../shared/accent";

interface ListItemProps {
    row: ConversationRow;
    isSelected: boolean;
    currentUserId: string | null;
    presenceStatus?: "online" | "idle" | "offline";
    onSelect: (id: string) => void;
    context?: ConversationContext | null;
    otherUserRole?: string | null;
    accent: AccentClasses;
}

export default function ListItem({
    row,
    isSelected,
    currentUserId,
    presenceStatus,
    onSelect,
    context,
    otherUserRole,
    accent,
}: ListItemProps) {
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
    const statusVariant =
        status.label === "Request"
            ? "yellow"
            : status.label === "Declined"
              ? "coral"
              : "teal";

    return (
        <div
            onClick={() => onSelect(convo.id)}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${accent.bgLight} ${accent.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 text-left">
                            <span className="font-black text-sm uppercase tracking-tight truncate text-dark">
                                {name}
                            </span>
                            {otherUserRole && (
                                <span className="badge badge-outline badge-xs">{otherUserRole}</span>
                            )}
                        </div>
                        <Presence status={presenceStatus} variant="badge" />
                    </div>

                    {contextLabel && (
                        <div className={`text-sm font-bold mb-1 truncate ${accent.text}`}>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {contextLabel}
                        </div>
                    )}

                    {context?.candidateName && (
                        <div className="text-xs text-start text-dark/50 truncate mb-1">
                            <i className="fa-duotone fa-regular fa-user-shield mr-1" />
                            Re: {context.candidateName}
                        </div>
                    )}

                    <div className="text-xs text-start text-dark/60">
                        {formatMessageDate(convo.last_message_at)}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <Badge variant={statusVariant}>{status.label}</Badge>
                    {participant.unread_count > 0 && (
                        <span className="badge badge-primary">
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
