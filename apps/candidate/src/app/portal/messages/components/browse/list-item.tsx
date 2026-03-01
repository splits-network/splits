"use client";

import { ConversationRow, UserSummary } from "./types";

interface MessageListItemProps {
    row: ConversationRow;
    otherUser?: UserSummary | null;
    isSelected: boolean;
    presenceStatus?: "online" | "idle" | "offline";
    onSelect: (id: string) => void;
}

function getInitials(value?: string | null): string {
    if (!value) return "??";
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "??";
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d`;
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessageListItem({
    row,
    otherUser,
    isSelected,
    presenceStatus,
    onSelect,
}: MessageListItemProps) {
    const convo = row.conversation;
    const name = otherUser?.name || otherUser?.email || "Unknown user";
    const hasUnread = row.participant.unread_count > 0;

    const presenceDot =
        presenceStatus === "online"
            ? "bg-success"
            : presenceStatus === "idle"
              ? "bg-warning"
              : null;

    return (
        <button
            type="button"
            onClick={() => onSelect(convo.id)}
            className={`
                group w-full text-left p-3 sm:p-4 cursor-pointer transition-colors
                border-l-4
                ${
                    isSelected
                        ? "bg-base-100 border-l-primary"
                        : "border-l-transparent hover:bg-base-100/60"
                }
            `}
        >
            <div className="flex items-start gap-3">
                {/* Avatar with presence dot */}
                <div className="relative shrink-0">
                    <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                        {getInitials(name)}
                    </div>
                    {presenceDot && (
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${presenceDot} border-2 border-base-200 rounded-full`}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span
                            className={`truncate ${hasUnread ? "font-bold" : "font-semibold"} text-sm`}
                        >
                            {name}
                        </span>
                        <span className="text-sm text-base-content/40 shrink-0">
                            {convo.last_message_at
                                ? formatRelativeTime(convo.last_message_at)
                                : ""}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                            {row.participant.request_state === "pending" && (
                                <span className="badge badge-warning badge-sm shrink-0">
                                    Request
                                </span>
                            )}
                            {row.participant.archived_at && (
                                <span className="badge badge-ghost badge-sm shrink-0">
                                    Archived
                                </span>
                            )}
                        </div>

                        {hasUnread && (
                            <span className="badge badge-primary badge-sm shrink-0">
                                {row.participant.unread_count}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
