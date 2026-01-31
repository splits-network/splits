"use client";
import { ConversationRow, UserSummary } from "./types";

interface MessageListItemProps {
    row: ConversationRow;
    otherUser?: UserSummary | null;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function MessageListItem({
    row,
    otherUser,
    isSelected,
    onSelect,
}: MessageListItemProps) {
    const convo = row.chat_conversations;
    const name = otherUser?.name || otherUser?.email || "Unknown user";

    return (
        <button
            type="button"
            onClick={() => onSelect(convo.id)}
            className={`w-full text-left p-4 hover:bg-base-200/60 transition ${
                isSelected ? "bg-base-200" : ""
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
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
                    </div>
                    <div className="text-xs text-base-content/60">
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
