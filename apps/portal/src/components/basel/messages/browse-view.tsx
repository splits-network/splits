"use client";

/**
 * Basel browse view — clean DaisyUI two-panel layout.
 * No @splits-network/shared-ui imports.
 */

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useFilter } from "@/app/portal/messages/contexts/filter-context";
import { getOtherUserId, getOtherParticipant, getInitials } from "@/app/portal/messages/types";
import BrowseListItem from "./browse-list-item";
import BrowseDetailPanel from "./browse-detail-panel";

export default function BrowseView() {
    const {
        data,
        loading,
        currentUserId,
        presenceMap,
        contextMap,
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
        <div className="flex h-full min-h-[500px]">
            {/* Left Panel - Conversation List */}
            <div
                className={`flex flex-col border-r border-base-300 bg-base-200 w-full md:w-96 lg:w-[420px] ${
                    selectedId ? "hidden md:flex" : "flex"
                }`}
            >
                <div className="flex-1 overflow-y-auto min-h-0">
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

                            const otherId = getOtherUserId(
                                convo,
                                currentUserId,
                            );
                            const presenceStatus = otherId
                                ? presenceMap[otherId]?.status
                                : undefined;

                            const other = getOtherParticipant(
                                convo,
                                currentUserId,
                            );
                            const otherUserRole = other?.user_role || null;
                            const initials = getInitials(other?.name || other?.email);

                            return (
                                <BrowseListItem
                                    key={
                                        row.participant?.conversation_id ||
                                        convo.id
                                    }
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

            {/* Right Panel - Thread */}
            <div
                className={`flex-1 flex-col bg-base-100 min-w-0 ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }`}
            >
                {selectedId ? (
                    <BrowseDetailPanel
                        id={selectedId}
                        item={selectedItem}
                        onClose={handleClose}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/60">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-messages text-4xl mb-3 block" />
                            <p>Select a conversation to view messages</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
