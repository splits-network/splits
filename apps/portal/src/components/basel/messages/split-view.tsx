"use client";

/**
 * Basel split view — editorial 40/60 layout with DaisyUI semantic tokens.
 * Replaces Memphis border-dark, colored shapes placeholder with Basel editorial.
 * Sharp corners, border-l-4 accent, subtle shadows.
 */

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LoadingState } from "@splits-network/shared-ui";
import { EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "@/app/portal/messages/contexts/filter-context";
import { getOtherUserId, getOtherParticipant } from "@/app/portal/messages/types";
import { accentAt } from "./accent";
import SplitItem from "./split-item";
import SplitDetailPanel from "./split-detail-panel";

export default function SplitView() {
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
        <div className="flex gap-0 lg:gap-6 min-h-[680px]">
            {/* Inbox panel (left ~38%) */}
            <div
                className={`inbox-panel opacity-0 flex flex-col w-full lg:w-[38%] bg-base-200 border border-base-300 overflow-hidden ${
                    selectedId ? "hidden lg:flex" : "flex"
                }`}
            >
                <div className="flex-1 overflow-y-auto">
                    {loading && data.length === 0 ? (
                        <div className="p-8">
                            <LoadingState message="Loading conversations..." />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title="No conversations found"
                                description="Try adjusting your search or filters"
                            />
                        </div>
                    ) : (
                        data.map((row, idx) => {
                            const convo = row.conversation;
                            if (!convo) return null;

                            const otherId = getOtherUserId(convo, currentUserId);
                            const presenceStatus = otherId
                                ? presenceMap[otherId]?.status
                                : undefined;

                            const other = getOtherParticipant(
                                convo,
                                currentUserId,
                            );
                            const otherUserRole = other?.user_role
                                ? other.user_role.charAt(0).toUpperCase() +
                                  other.user_role.slice(1)
                                : null;

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
                                    accent={accentAt(idx)}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Thread panel (right ~62%) */}
            <div
                className={`thread-panel opacity-0 flex flex-col flex-1 bg-base-100 border border-base-300 overflow-hidden ${
                    selectedId
                        ? "fixed inset-0 z-50 block bg-base-100 lg:static lg:z-auto"
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
