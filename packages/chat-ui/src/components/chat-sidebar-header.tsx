"use client";

import Link from "next/link";
import { useChatSidebar } from "../context/chat-sidebar-context";
import { getOtherParticipant } from "../types/chat-types";

export interface ChatSidebarHeaderProps {
    messagesPagePath?: string;
    /** Current user ID for resolving other participant */
    currentUserId?: string | null;
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

export function ChatSidebarHeader({
    messagesPagePath = "/portal/messages",
    currentUserId,
    onCallClick,
}: ChatSidebarHeaderProps) {
    const {
        view,
        isMinimized,
        activeConversationId,
        activeConversationMeta,
        conversations,
        close,
        minimize,
        restore,
        goBackToList,
        unreadTotalCount,
    } = useChatSidebar();

    // Minimized: compact bar with title, restore, and close
    if (isMinimized) {
        return (
            <div className="sticky top-0  backdrop-blur-md bg-base-100/90 border-b border-base-300">
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
        <div className="sticky top-0  backdrop-blur-md bg-base-100/90 border-b border-base-300">
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
                    {onCallClick && (
                        <button
                            onClick={() => {
                                if (view === "thread") {
                                    const conv = conversations.find(c => c.conversation.id === activeConversationId);
                                    // Resolve other user ID: prefer meta, fall back to conversation participants
                                    let otherUserId = activeConversationMeta?.otherUserId ?? null;
                                    if (!otherUserId && conv && currentUserId) {
                                        otherUserId = currentUserId === conv.conversation.participant_a_id
                                            ? conv.conversation.participant_b_id
                                            : conv.conversation.participant_a_id;
                                    }
                                    // Get other participant details from conversation data
                                    const otherDetails = conv ? getOtherParticipant(conv.conversation, currentUserId ?? null) : null;
                                    onCallClick(
                                        otherUserId,
                                        otherDetails ? {
                                            name: otherDetails.name,
                                            email: otherDetails.email,
                                            profile_image_url: otherDetails.profile_image_url,
                                        } : null,
                                        conv ? {
                                            application_id: conv.conversation.application_id,
                                            job_id: conv.conversation.job_id,
                                            company_id: conv.conversation.company_id,
                                            candidate_id: conv.conversation.candidate_id,
                                        } : undefined,
                                    );
                                } else {
                                    onCallClick(null);
                                }
                            }}
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label={view === "thread" ? "Call this person" : "Start a call"}
                            title={view === "thread" ? "Call" : "New call"}
                        >
                            <i className="fa-duotone fa-regular fa-phone" />
                        </button>
                    )}

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
