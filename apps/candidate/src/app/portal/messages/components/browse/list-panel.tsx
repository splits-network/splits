"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import { registerChatRefresh, requestChatRefresh } from "@/lib/chat-refresh-queue";
import { getCachedCurrentUserId } from "@/lib/current-user-profile";
import { usePresence } from "@/hooks/use-presence";
import MessageListItem from "./list-item";
import { ConversationRow, UserSummary } from "./types";

interface ListPanelProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function ListPanel({ selectedId, onSelect }: ListPanelProps) {
    const { getToken } = useAuth();
    const [filter, setFilter] = useState<"inbox" | "requests" | "archived">(
        "inbox",
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ConversationRow[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");

    const fetchConversations = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/chat/conversations", {
            params: { filter, limit: 50 },
        });
        setRows((response?.data || []) as ConversationRow[]);
    }, [filter, getToken]);


    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = await getCachedCurrentUserId(getToken);
                if (!mounted) return;
                setCurrentUserId(userId);
                await fetchConversations();
            } catch (err: any) {
                setError(err?.message || "Failed to load conversations");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [filter, fetchConversations, getToken]);

    const otherUserIds = useMemo(() => {
        if (!currentUserId) return [];
        const ids = new Set<string>();
        rows.forEach((row) => {
            const convo = row.conversation;
            const otherId =
                convo.participant_a_id === currentUserId
                    ? convo.participant_b_id
                    : convo.participant_a_id;
            if (otherId) ids.add(otherId);
        });
        return Array.from(ids);
    }, [rows, currentUserId]);

    const presenceMap = usePresence(otherUserIds, {
        enabled: Boolean(currentUserId),
    });

    useEffect(() => {
        const unregister = registerChatRefresh(() => fetchConversations());
        return () => {
            unregister();
        };
    }, [fetchConversations]);

    useChatGateway({
        enabled: Boolean(currentUserId),
        channels: currentUserId ? [`user:${currentUserId}`] : [],
        getToken,
        onReconnect: () => {
            requestChatRefresh();
        },
        onEvent: (event) => {
            if (
                [
                    "message.created",
                    "message.updated",
                    "conversation.updated",
                    "conversation.requested",
                    "conversation.accepted",
                    "conversation.declined",
                ].includes(event.type)
            ) {
                requestChatRefresh();
            }
        },
    });

    const filteredRows = useMemo(() => {
        if (!searchInput.trim()) return rows;
        const query = searchInput.toLowerCase();
        return rows.filter((row) => {
            const convo = row.conversation;
            const otherId =
                currentUserId && convo.participant_a_id === currentUserId
                    ? convo.participant_b_id
                    : convo.participant_a_id;
            const other =
                otherId === convo.participant_a_id
                    ? convo.participant_a
                    : convo.participant_b;
            const name = other?.name || "";
            const email = other?.email || "";
            return (
                name.toLowerCase().includes(query) ||
                email.toLowerCase().includes(query)
            );
        });
    }, [rows, searchInput, currentUserId]);

    return (
        <div
            className={`flex flex-col border-r border-base-300 bg-base-200 w-full md:w-96 lg:w-[420px] ${
                selectedId ? "hidden md:flex" : "flex"
            }`}
        >
            <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                <div role="tablist" className="tabs tabs-box w-full mb-4">
                    {(["inbox", "requests", "archived"] as const).map(
                        (tab) => (
                            <a
                                key={tab}
                                role="tab"
                                className={`tab ${
                                    filter === tab ? "tab-active" : ""
                                }`}
                                onClick={() => setFilter(tab)}
                            >
                                {tab[0].toUpperCase() + tab.slice(1)}
                            </a>
                        ),
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        type="search"
                        className="input input-bordered w-full"
                        placeholder="Search messages..."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 relative">
                {loading && rows.length === 0 ? (
                    <div className="p-8 text-center text-base-content/50">
                        <span className="loading loading-spinner loading-md mb-2"></span>
                        <p>Loading conversations...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-error">{error}</div>
                ) : filteredRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                        <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3 opacity-50" />
                        <p>No conversations found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-base-300">
                        {filteredRows.map((row) => {
                            const convo = row.conversation;
                            const otherId =
                                currentUserId &&
                                convo.participant_a_id === currentUserId
                                    ? convo.participant_b_id
                                    : convo.participant_a_id;
                            const other =
                                otherId === convo.participant_a_id
                                    ? convo.participant_a
                                    : convo.participant_b;
                            const presenceStatus = otherId
                                ? presenceMap[otherId]?.status
                                : undefined;
                            return (
                                <MessageListItem
                                    key={row.participant.conversation_id}
                                    row={row}
                                    otherUser={other}
                                    isSelected={selectedId === convo.id}
                                    presenceStatus={presenceStatus}
                                    onSelect={onSelect}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
