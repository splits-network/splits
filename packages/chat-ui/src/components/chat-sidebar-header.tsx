"use client";

import Link from "next/link";
import { useChatSidebar } from "../context/chat-sidebar-context";

export interface ChatSidebarHeaderProps {
    messagesPagePath?: string;
}

export function ChatSidebarHeader({
    messagesPagePath = "/portal/messages",
}: ChatSidebarHeaderProps) {
    const {
        view,
        isMinimized,
        activeConversationId,
        activeConversationMeta,
        close,
        minimize,
        restore,
        goBackToList,
        unreadTotalCount,
    } = useChatSidebar();

    // Minimized: compact bar with title, restore, and close
    if (isMinimized) {
        return (
            <div className="sticky top-0 z-10 backdrop-blur-md bg-base-100/90 border-b border-base-300">
                <div className="h-0.5 bg-primary w-full" />
                <div className="px-3 py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-lg font-black tracking-tight">
                            Messages
                        </h2>
                        {unreadTotalCount > 0 && (
                            <span className="badge badge-primary badge-sm">
                                {unreadTotalCount > 99
                                    ? "99+"
                                    : unreadTotalCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 flex-none">
                        <button
                            onClick={restore}
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label="Expand chat"
                            title="Expand"
                        >
                            <i className="fa-duotone fa-regular fa-chevron-up" />
                        </button>
                        <button
                            onClick={close}
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label="Close chat"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sticky top-0 z-10 backdrop-blur-md bg-base-100/90 border-b border-base-300">
            {/* Top accent line */}
            <div className="h-0.5 bg-primary w-full" />

            <div className="px-3 py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {view === "thread" && (
                        <button
                            onClick={goBackToList}
                            className="btn btn-ghost btn-sm btn-square flex-none"
                            aria-label="Back to conversations"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                        </button>
                    )}

                    <div className="min-w-0">
                        {view === "list" ? (
                            <h2 className="text-lg font-black tracking-tight">
                                Messages
                            </h2>
                        ) : (
                            <h2 className="text-base font-bold truncate">
                                {activeConversationMeta?.otherUserName ||
                                    "Conversation"}
                            </h2>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-none">
                    {view === "thread" && activeConversationId && (
                        <Link
                            href={`${messagesPagePath}?conversationId=${activeConversationId}`}
                            className="btn btn-ghost btn-sm"
                            title="Open in full messages page"
                        >
                            <i className="fa-duotone fa-regular fa-expand" />
                        </Link>
                    )}

                    <button
                        onClick={minimize}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Minimize chat"
                        title="Minimize"
                    >
                        <i className="fa-duotone fa-regular fa-chevron-down" />
                    </button>

                    <button
                        onClick={close}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Close chat"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>
            </div>
        </div>
    );
}
