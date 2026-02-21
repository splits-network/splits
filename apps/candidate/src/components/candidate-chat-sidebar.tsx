"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    ChatSidebarProvider,
    ChatSidebarShell,
} from "@splits-network/chat-ui";
import type { ConversationRow } from "@splits-network/chat-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { getCachedCurrentUserId } from "@/lib/current-user-profile";
import { useToast } from "@/lib/toast-context";
import ThreadPanel from "@/app/portal/messages/components/thread-panel";

export function CandidateChatSidebar({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSignedIn, getToken } = useAuth();
    const toast = useToast();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Only resolve user ID when signed in
    useEffect(() => {
        if (!isSignedIn) return;
        let mounted = true;
        getCachedCurrentUserId(getToken).then((id) => {
            if (mounted) setCurrentUserId(id);
        });
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn]);

    const fetchConversations = useCallback(async (filter: string): Promise<ConversationRow[]> => {
        const token = await getToken();
        if (!token) return [];
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/chat/conversations", {
            params: { filter, limit: 100 },
        });
        return (response?.data || []) as ConversationRow[];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleIncomingMessage = useCallback((data: {
        conversationId: string;
        senderName: string;
        preview: string;
    }) => {
        const msg = data.preview
            ? `${data.senderName}: ${data.preview}`
            : `New message from ${data.senderName}`;
        toast.info(msg, 8000);
    }, [toast]);

    const threadRenderer = useCallback((conversationId: string) => (
        <ThreadPanel conversationId={conversationId} />
    ), []);

    return (
        <ChatSidebarProvider
            userId={currentUserId}
            getToken={getToken}
            fetchConversations={fetchConversations}
            onIncomingMessage={handleIncomingMessage}
            messagesPagePath="/portal/messages"
        >
            {children}
            <ChatSidebarShell
                threadRenderer={threadRenderer}
                messagesPagePath="/portal/messages"
                currentUserId={currentUserId}
            />
        </ChatSidebarProvider>
    );
}
