"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LoadingState } from "@splits-network/shared-ui";
import { EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import { getOtherUserId, getOtherParticipant } from "../../types";
import { accentAt } from "../shared/accent";
import ListItem from "./split-item";
import DetailPanel from "./detail-panel";

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
        <div className="flex gap-0 border-4 border-dark min-h-[680px] bg-white">
            <div
                className={`w-full md:w-2/5 border-r-4 border-dark overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
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
                            <ListItem
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

            <div
                className={`${
                    selectedId
                        ? "fixed inset-0 z-50 block bg-white md:static md:z-auto"
                        : "hidden md:block"
                } md:w-3/5 w-full`}
            >
                {selectedId ? (
                    <DetailPanel
                        id={selectedId}
                        item={selectedItem}
                        onClose={handleClose}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Conversation
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a conversation on the left to view messages
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
