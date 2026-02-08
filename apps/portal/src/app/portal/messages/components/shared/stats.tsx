"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface MessageStats {
    totalConversations: number;
    unreadMessages: number;
    pendingRequests: number;
    archivedConversations: number;
}

const emptyStats: MessageStats = {
    totalConversations: 0,
    unreadMessages: 0,
    pendingRequests: 0,
    archivedConversations: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<MessageStats>(emptyStats);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isLoaded) return;

            const token = await getToken();
            if (!token) {
                if (!cancelled) setStats(emptyStats);
                return;
            }

            try {
                const client = createAuthenticatedClient(token);

                const [inboxRes, requestsRes, archivedRes] = await Promise.all([
                    client.get("/chat/conversations", {
                        params: { filter: "inbox", limit: 100 },
                    }) as Promise<any>,
                    client.get("/chat/conversations", {
                        params: { filter: "requests", limit: 100 },
                    }) as Promise<any>,
                    client.get("/chat/conversations", {
                        params: { filter: "archived", limit: 100 },
                    }) as Promise<any>,
                ]);

                const inboxData = inboxRes?.data || [];
                const requestsData = requestsRes?.data || [];
                const archivedData = archivedRes?.data || [];

                const normalizeRows = (data: any[]) =>
                    data.map((row: any) => {
                        if (row.conversation && row.participant) return row;
                        return {
                            conversation: row.chat_conversations,
                            participant: {
                                unread_count: row.unread_count || 0,
                                request_state: row.request_state,
                            },
                        };
                    });

                const inbox = normalizeRows(inboxData);
                const requests = normalizeRows(requestsData);
                const archived = normalizeRows(archivedData);

                const unreadMessages = inbox.reduce(
                    (sum: number, row: any) =>
                        sum + (row.participant?.unread_count || 0),
                    0,
                );

                const pendingRequests = requests.filter(
                    (row: any) =>
                        row.participant?.request_state === "pending",
                ).length;

                if (!cancelled) {
                    setStats({
                        totalConversations: inbox.length,
                        unreadMessages,
                        pendingRequests,
                        archivedConversations: archived.length,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch message stats:", error);
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Conversations"
                    value={stats.totalConversations}
                    icon="fa-duotone fa-regular fa-messages"
                    description="Active inbox conversations"
                />
                <StatCard
                    title="Unread"
                    value={stats.unreadMessages}
                    icon="fa-duotone fa-regular fa-envelope"
                    color="info"
                    description="Messages awaiting read"
                />
                <StatCard
                    title="Requests"
                    value={stats.pendingRequests}
                    icon="fa-duotone fa-regular fa-hourglass-half"
                    color="warning"
                    description="Pending conversation requests"
                />
                <StatCard
                    title="Archived"
                    value={stats.archivedConversations}
                    icon="fa-duotone fa-regular fa-box-archive"
                    color="neutral"
                    description="Archived conversations"
                />
            </StatCardGrid>
        </div>
    );
}
