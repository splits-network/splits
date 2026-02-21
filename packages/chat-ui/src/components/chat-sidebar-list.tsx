"use client";

import { useState, useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useChatSidebar } from "../context/chat-sidebar-context";
import { ChatSidebarListItem } from "./chat-sidebar-list-item";
import { getOtherParticipant } from "../types/chat-types";
import type { Mailbox } from "../types/chat-types";

export interface ChatSidebarListProps {
    currentUserId: string | null;
}

export function ChatSidebarList({ currentUserId }: ChatSidebarListProps) {
    const {
        conversations,
        conversationsLoading,
        refreshConversations,
        openToThread,
    } = useChatSidebar();

    const [searchInput, setSearchInput] = useState("");
    const [mailbox, setMailbox] = useState<Mailbox>("inbox");
    const listRef = useRef<HTMLDivElement>(null);

    // Filter by mailbox
    const mailboxFiltered = useMemo(() => {
        return conversations.filter((row) => {
            const isArchived = !!row.participant.archived_at;
            const isPending = row.participant.request_state === "pending";

            if (mailbox === "archived") return isArchived;
            if (mailbox === "requests") return isPending && !isArchived;
            // inbox: accepted/none, not archived
            return !isArchived && !isPending;
        });
    }, [conversations, mailbox]);

    // Filter by search
    const filtered = useMemo(() => {
        if (!searchInput.trim()) return mailboxFiltered;
        const q = searchInput.toLowerCase();
        return mailboxFiltered.filter((row) => {
            const other = getOtherParticipant(row.conversation, currentUserId);
            if (!other) return false;
            return (
                (other.name?.toLowerCase().includes(q)) ||
                other.email.toLowerCase().includes(q)
            );
        });
    }, [mailboxFiltered, searchInput, currentUserId]);

    // Sort by last message
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const aTime = a.conversation.last_message_at || a.conversation.created_at;
            const bTime = b.conversation.last_message_at || b.conversation.created_at;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
    }, [filtered]);

    // GSAP stagger animation on list items
    useGSAP(() => {
        if (!listRef.current || sorted.length === 0) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const items = listRef.current.querySelectorAll("[data-sidebar-item]");
        if (!items.length) return;

        gsap.fromTo(items,
            { y: 8, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.25, stagger: 0.03, ease: "power3.out" },
        );
    }, { dependencies: [sorted.length, mailbox], scope: listRef });

    const requestCount = useMemo(() => {
        return conversations.filter(
            (r) => r.participant.request_state === "pending" && !r.participant.archived_at,
        ).length;
    }, [conversations]);

    const handleSelect = (row: typeof sorted[number]) => {
        const other = getOtherParticipant(row.conversation, currentUserId);
        openToThread(row.conversation.id, {
            otherUserName: other?.name ?? undefined,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="px-3 py-2 border-b border-base-300">
                <div className="relative">
                    <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="input input-sm w-full pl-9 bg-base-200 border-none rounded-none text-sm"
                    />
                </div>
            </div>

            {/* Mailbox tabs */}
            <div className="flex border-b border-base-300 px-3">
                {(["inbox", "requests", "archived"] as Mailbox[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setMailbox(tab)}
                        className={`px-3 py-2 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                            mailbox === tab
                                ? "border-primary text-primary"
                                : "border-transparent text-base-content/50 hover:text-base-content/80"
                        }`}
                    >
                        {tab}
                        {tab === "requests" && requestCount > 0 && (
                            <span className="ml-1.5 badge badge-warning badge-sm">{requestCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div ref={listRef} className="flex-1 overflow-y-auto">
                {conversationsLoading && sorted.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="loading loading-spinner loading-sm text-primary" />
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <i className="fa-duotone fa-regular fa-messages text-3xl text-base-content/20 mb-3" />
                        <p className="text-sm text-base-content/50">
                            {searchInput ? "No conversations match your search" : "No conversations yet"}
                        </p>
                    </div>
                ) : (
                    sorted.map((row) => (
                        <ChatSidebarListItem
                            key={row.conversation.id}
                            row={row}
                            currentUserId={currentUserId}
                            onSelect={() => handleSelect(row)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
