"use client";

import type { ConversationRow } from "../types/chat-types";
import {
    getOtherParticipant,
    getInitials,
    formatMessageDate,
    getRequestStateDisplay,
} from "../types/chat-types";

export interface ChatSidebarListItemProps {
    row: ConversationRow;
    currentUserId: string | null;
    onSelect: () => void;
}

export function ChatSidebarListItem({
    row,
    currentUserId,
    onSelect,
}: ChatSidebarListItemProps) {
    const other = getOtherParticipant(row.conversation, currentUserId);
    const initials = getInitials(other?.name);
    const unread = row.participant.unread_count || 0;
    const timestamp = formatMessageDate(row.conversation.last_message_at);
    const isRequest = row.participant.request_state === "pending";
    const isArchived = !!row.participant.archived_at;
    const status = (isRequest || isArchived) ? getRequestStateDisplay(row) : null;

    // Role-based avatar color
    const roleColor = other?.user_role === "recruiter"
        ? "bg-primary text-primary-content"
        : other?.user_role === "company"
            ? "bg-secondary text-secondary-content"
            : "bg-accent text-accent-content";

    return (
        <button
            data-sidebar-item
            onClick={onSelect}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-base-200 border-b border-base-200 ${
                unread > 0 ? "bg-base-200/50" : ""
            }`}
        >
            {/* Avatar */}
            <div className={`flex-none w-10 h-10 flex items-center justify-center text-sm font-bold ${roleColor}`}>
                {other?.profile_image_url ? (
                    <img
                        src={other.profile_image_url}
                        alt={other.name || "User"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    initials
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${unread > 0 ? "font-bold" : "font-medium"}`}>
                        {other?.name || other?.email || "Unknown"}
                    </span>
                    <span className="text-sm text-base-content/40 flex-none">
                        {timestamp}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                    {status ? (
                        <span className={`badge badge-sm ${status.badgeClass}`}>
                            <i className={`fa-duotone fa-regular ${status.icon} mr-1`} />
                            {status.label}
                        </span>
                    ) : (
                        <span className="text-sm text-base-content/50 truncate">
                            {other?.user_role
                                ? other.user_role.charAt(0).toUpperCase() + other.user_role.slice(1)
                                : ""}
                        </span>
                    )}

                    {unread > 0 && (
                        <span className="badge badge-primary badge-sm flex-none">
                            {unread > 99 ? "99+" : unread}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
