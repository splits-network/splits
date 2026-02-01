"use client";

import { Presence } from "@/components/presense";
import { ConversationRow, UserSummary } from "./types";

interface MessageListItemProps {
    row: ConversationRow;
    otherUser?: UserSummary | null;
    isSelected: boolean;
    presenceStatus?: "online" | "offline";
    onSelect: (id: string) => void;
}

export default function MessageListItem({
    row,
    otherUser,
    isSelected,
    presenceStatus,
    onSelect,
}: MessageListItemProps) {
    const convo = row.chat_conversations;
    const name = otherUser?.name || otherUser?.email || "Unknown user";

    return (
        <button
            type="button"
            onClick={() => onSelect(convo.id)}
            className={`
                group w-full relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${
                    isSelected
                        ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                        : "border-l-4 border-l-transparent"
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold">{name}</span>
                        {row.request_state === "pending" && (
                            <span className="badge badge-warning badge-sm">
                                Request
                            </span>
                        )}
                        {row.archived_at && (
                            <span className="badge badge-ghost badge-sm">
                                Archived
                            </span>
                        )}
                        <Presence
                            status={presenceStatus}
                            variant="badge"
                            size="md"
                        />
                    </div>
                    <div className="text-xs text-start text-base-content/60">
                        {convo.last_message_at
                            ? new Date(convo.last_message_at).toLocaleString()
                            : "No messages yet"}
                    </div>
                </div>
                {row.unread_count > 0 && (
                    <span className="badge badge-primary">
                        {row.unread_count}
                    </span>
                )}
            </div>
        </button>
    );
}
