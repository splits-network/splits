"use client";

/**
 * Email list item — Basel split-item style with border-l-4 active state,
 * square avatar, sender name, subject, snippet, date, unread indicator.
 */

import type { EmailListItem as EmailListItemType } from "@splits-network/shared-types";

interface EmailListItemProps {
    message: EmailListItemType;
    isSelected: boolean;
    onSelect: (threadId: string) => void;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitial(msg: EmailListItemType): string {
    return (msg.from?.name || msg.from?.email || "?")[0].toUpperCase();
}

export default function EmailListItem({
    message,
    isSelected,
    onSelect,
}: EmailListItemProps) {
    const isUnread = message.isRead === false;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(message.threadId)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(message.threadId);
                }
            }}
            className={`relative w-full text-left p-4 border-b border-base-300 transition-all hover:bg-base-300/50 cursor-pointer ${
                isSelected
                    ? "bg-base-100 border-l-4 border-l-primary"
                    : "border-l-4 border-l-transparent"
            } ${isUnread ? "bg-primary/5" : ""}`}
        >
            <div className="flex gap-3">
                {/* Square avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                        {getInitial(message)}
                    </div>
                    {isUnread && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <span
                            className={`text-sm truncate ${
                                isUnread
                                    ? "font-black text-base-content"
                                    : "font-semibold text-base-content/70"
                            }`}
                        >
                            {message.from?.name ||
                                message.from?.email ||
                                "Unknown"}
                        </span>
                        <span className="text-sm text-base-content/40 flex-shrink-0 ml-2">
                            {formatDate(message.date)}
                        </span>
                    </div>

                    <p
                        className={`text-sm truncate ${
                            isUnread
                                ? "font-bold text-base-content"
                                : "text-base-content/70"
                        }`}
                    >
                        {message.subject || "(no subject)"}
                    </p>

                    {message.snippet && (
                        <p className="text-sm text-base-content/40 truncate mt-0.5">
                            {message.snippet}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
