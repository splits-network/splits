"use client";

import { useEffect, type ReactNode } from "react";
import { useChatSidebar } from "../context/chat-sidebar-context";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarList } from "./chat-sidebar-list";
import { ChatSidebarThread } from "./chat-sidebar-thread";

export interface ChatSidebarShellProps {
    /** Render prop for the thread panel — each app provides its own ThreadPanel */
    threadRenderer: (conversationId: string) => ReactNode;
    /** Path to the full messages page (for "Open Full" link) */
    messagesPagePath?: string;
    /** Current user ID for conversation list */
    currentUserId: string | null;
    /** Called when user clicks call icon. Receives other user ID, participant details, and entity context when in thread view. */
    onCallClick?: (otherUserId: string | null, otherUserDetails?: {
        name: string | null;
        email: string;
        profile_image_url?: string | null;
    } | null, entityContext?: {
        application_id?: string | null;
        job_id?: string | null;
        company_id?: string | null;
        candidate_id?: string | null;
    }) => void;
}

const SIDEBAR_WIDTH = 420;

export function ChatSidebarShell({
    threadRenderer,
    messagesPagePath = "/portal/messages",
    currentUserId,
    onCallClick,
}: ChatSidebarShellProps) {
    const { isOpen, isMinimized, view, activeConversationId, close } =
        useChatSidebar();

    // Escape key to close
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, close]);

    return (
        <div
            className={`fixed bottom-0 right-0 shadow-md overflow-y-auto
                max-h-[80vh] ${isMinimized ? "h-12" : "h-auto"} transition-[width,opacity] duration-300 ease-in-out
                `}
            style={{
                width: isOpen ? SIDEBAR_WIDTH : 0,
                opacity: isOpen ? 1 : 0,
            }}
        >
            {isOpen && (
                <div className="flex flex-col h-full bg-base-100 border-l-4 border-primary overflow-hidden">
                    <ChatSidebarHeader messagesPagePath={messagesPagePath} currentUserId={currentUserId} onCallClick={onCallClick} />
                    {!isMinimized && (
                        <div className="flex-1 min-h-0 flex flex-col">
                            {view === "list" && (
                                <ChatSidebarList currentUserId={currentUserId} />
                            )}
                            {view === "thread" && activeConversationId && (
                                <ChatSidebarThread
                                    conversationId={activeConversationId}
                                    messagesPagePath={messagesPagePath}
                                >
                                    {threadRenderer(activeConversationId)}
                                </ChatSidebarThread>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
