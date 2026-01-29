"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PageTitle } from "@/components/page-title";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import { registerChatRefresh, requestChatRefresh } from "@/lib/chat-refresh-queue";
import { getCachedCurrentUserId } from "@/lib/current-user";
import { getCachedUserSummary } from "@/lib/user-cache";

type ConversationRow = {
    conversation_id: string;
    user_id: string;
    muted_at: string | null;
    archived_at: string | null;
    request_state: "none" | "pending" | "accepted" | "declined";
    last_read_at: string | null;
    last_read_message_id: string | null;
    unread_count: number;
    chat_conversations: {
        id: string;
        participant_a_id: string;
        participant_b_id: string;
        application_id: string | null;
        job_id: string | null;
        company_id: string | null;
        last_message_at: string | null;
        last_message_id: string | null;
        created_at: string;
        updated_at: string;
    };
};

type UserSummary = {
    id: string;
    name: string | null;
    email: string;
};

export default function MessagesPage() {
    const { getToken } = useAuth();
    const [filter, setFilter] = useState<"inbox" | "requests" | "archived">(
        "inbox",
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ConversationRow[]>([]);
    const [userMap, setUserMap] = useState<Record<string, UserSummary>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/chat/conversations", {
            params: { filter, limit: 50 },
        });
        setRows((response?.data || []) as ConversationRow[]);
    }, [filter, getToken]);

    const fetchUsers = async (ids: string[]) => {
        if (ids.length === 0) return;
        const updates: Record<string, UserSummary> = {};
        await Promise.all(
            ids.map(async (id) => {
                try {
                    const user = await getCachedUserSummary(getToken, id);
                    if (!user) throw new Error("missing");
                    updates[id] = user;
                } catch {
                    updates[id] = { id, name: null, email: "Unknown" };
                }
            }),
        );
        setUserMap((prev) => ({ ...prev, ...updates }));
    };

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
    }, [filter]);

    const otherUserIds = useMemo(() => {
        if (!currentUserId) return [];
        const ids = new Set<string>();
        rows.forEach((row) => {
            const convo = row.chat_conversations;
            const otherId =
                convo.participant_a_id === currentUserId
                    ? convo.participant_b_id
                    : convo.participant_a_id;
            if (otherId && !userMap[otherId]) ids.add(otherId);
        });
        return Array.from(ids);
    }, [rows, currentUserId, userMap]);

    useEffect(() => {
        if (otherUserIds.length > 0) {
            fetchUsers(otherUserIds);
        }
    }, [otherUserIds]);

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

    return (
        <>
            <PageTitle
                title="Messages"
                subtitle="Manage candidate and company conversations"
            />

            <div className="space-y-4">
                <div role="tablist" className="tabs tabs-box w-full">
                    {(["inbox", "requests", "archived"] as const).map(
                        (tab) => (
                            <a
                                key={tab}
                                role="tab"
                                className={`tab ${filter === tab ? "tab-active" : ""}`}
                                onClick={() => setFilter(tab)}
                            >
                                {tab[0].toUpperCase() + tab.slice(1)}
                            </a>
                        ),
                    )}
                </div>

                {loading ? (
                    <div className="p-8 text-center text-base-content/60">
                        <span className="loading loading-spinner loading-md mb-2"></span>
                        <p>Loading conversations...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-error">{error}</div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center text-base-content/50">
                        <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3 opacity-50"></i>
                        <p>No conversations yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-base-200 rounded-lg border border-base-200 bg-base-100">
                        {rows.map((row) => {
                            const convo = row.chat_conversations;
                            const otherId =
                                convo.participant_a_id === currentUserId
                                    ? convo.participant_b_id
                                    : convo.participant_a_id;
                            const other = otherId ? userMap[otherId] : null;
                            const name =
                                other?.name || other?.email || "Unknown user";

                            return (
                                <Link
                                    key={row.conversation_id}
                                    href={`/portal/messages/${convo.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-base-200/60"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                {name}
                                            </span>
                                            {row.request_state === "pending" && (
                                                <span className="badge badge-warning badge-sm">
                                                    Request
                                                </span>
                                            )}
                                            {row.archived_at && (
                                                <span className="badge badge-ghost badge-sm">
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-base-content/60">
                                            {convo.last_message_at
                                                ? new Date(
                                                      convo.last_message_at,
                                                  ).toLocaleString()
                                                : "No messages yet"}
                                        </div>
                                    </div>
                                    {row.unread_count > 0 && (
                                        <span className="badge badge-primary">
                                            {row.unread_count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
