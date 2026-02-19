"use client";

/**
 * Basel split view — matches showcase/messages/one exactly.
 * 38% inbox / 62% thread, fixed height.
 * Search + filters are INSIDE the inbox panel header (showcase style).
 * No @splits-network/shared-ui imports.
 */

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useFilter } from "@/app/portal/messages/contexts/filter-context";
import { getOtherUserId, getOtherParticipant, getInitials } from "@/app/portal/messages/types";
import type { Mailbox } from "@/app/portal/messages/types";
import SplitItem from "./split-item";
import SplitDetailPanel from "./split-detail-panel";

const mailboxOptions: { value: Mailbox; label: string }[] = [
    { value: "inbox", label: "Inbox" },
    { value: "requests", label: "Requests" },
    { value: "archived", label: "Archived" },
];

export default function SplitView() {
    const {
        data,
        loading,
        currentUserId,
        presenceMap,
        contextMap,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        refresh,
        requestCount,
    } = useFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("conversationId");
    const selectedItem = useMemo(
        () =>
            selectedId
                ? (data.find(
                      (row) => row.conversation.id === selectedId,
                  ) ?? null)
                : null,
        [selectedId, data],
    );

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("conversationId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("conversationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <div className="flex gap-0 lg:gap-6 h-[calc(100vh-20rem)] min-h-[500px]">
            {/* ── INBOX PANEL (left 38%) ─────────────────────────── */}
            <div
                className={`inbox-panel flex flex-col w-full lg:w-[38%] bg-base-200 border border-base-300 overflow-hidden ${
                    selectedId ? "hidden lg:flex" : "flex"
                }`}
            >
                {/* Inbox header — showcase style: title, search, filter pills */}
                <div className="p-4 border-b border-base-300 bg-base-200">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black tracking-tight">
                            Inbox
                        </h2>
                        <button
                            onClick={refresh}
                            className="btn btn-ghost btn-sm btn-square"
                            disabled={loading}
                            title="Refresh conversations"
                        >
                            <i
                                className={`fa-duotone fa-regular fa-arrows-rotate text-base-content/60 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            disabled={loading}
                            className="input input-sm w-full pl-9 bg-base-100 border-base-300 focus:outline-none"
                        />
                        {searchInput && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-square"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        )}
                    </div>

                    {/* Mailbox filter pills */}
                    <div className="flex gap-1.5 flex-wrap">
                        {mailboxOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter("mailbox", opt.value)}
                                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                                    filters.mailbox === opt.value
                                        ? "bg-neutral text-neutral-content"
                                        : "bg-base-100 text-base-content/60 hover:bg-base-300"
                                }`}
                            >
                                {opt.label}
                                {opt.value === "requests" && requestCount > 0 && (
                                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-accent text-accent-content text-[9px] font-bold rounded-full">
                                        {requestCount > 99 ? "99+" : requestCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                    {loading && data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="loading loading-spinner loading-md text-primary" />
                            <p className="text-sm text-base-content/50 mt-3">Loading conversations...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3" />
                            <p className="text-sm">No conversations found</p>
                        </div>
                    ) : (
                        data.map((row) => {
                            const convo = row.conversation;
                            if (!convo) return null;

                            const otherId = getOtherUserId(convo, currentUserId);
                            const presenceStatus = otherId
                                ? presenceMap[otherId]?.status
                                : undefined;

                            const other = getOtherParticipant(convo, currentUserId);
                            const otherUserRole = other?.user_role || null;
                            const initials = getInitials(other?.name || other?.email);

                            return (
                                <SplitItem
                                    key={row.participant?.conversation_id || convo.id}
                                    row={row}
                                    isSelected={selectedId === convo.id}
                                    currentUserId={currentUserId}
                                    presenceStatus={presenceStatus}
                                    onSelect={handleSelect}
                                    context={contextMap[convo.id]}
                                    otherUserRole={otherUserRole}
                                    initials={initials}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── THREAD PANEL (right 62%) ────────────────────────── */}
            <div
                className={`thread-panel flex flex-col flex-1 bg-base-100 border border-base-300 overflow-hidden ${
                    selectedId
                        ? "fixed inset-0 z-50 flex bg-base-100 lg:static lg:z-auto"
                        : "hidden lg:flex"
                }`}
            >
                {selectedId ? (
                    <SplitDetailPanel
                        id={selectedId}
                        item={selectedItem}
                        onClose={handleClose}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-messages text-2xl text-primary" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight mb-2 text-base-content">
                                Select a Conversation
                            </h3>
                            <p className="text-sm text-base-content/50">
                                Click a conversation on the left to view messages
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
