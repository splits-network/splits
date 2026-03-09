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
import ThreadPanel from "@/components/chat/thread-panel";
import { CallCreationModal } from "@/components/calls/call-creation-modal";
import type { Participant } from "@/components/calls/participant-picker";

export function PortalChatSidebar({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSignedIn, getToken } = useAuth();
    const toast = useToast();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [callParticipants, setCallParticipants] = useState<Participant[]>([]);

    // Resolve user ID when signed in, clear on sign-out
    useEffect(() => {
        if (!isSignedIn) {
            setCurrentUserId(null);
            return;
        }
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

    const handleCallClick = useCallback(async (otherUserId: string | null) => {
        const participants: Participant[] = [];

        // If we have the other user's ID, look up their details for pre-fill
        if (otherUserId) {
            try {
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    const response: any = await client.get(`/users/${otherUserId}/profile`);
                    const profile = response?.data;
                    if (profile) {
                        participants.push({
                            user_id: otherUserId,
                            first_name: profile.first_name || '',
                            last_name: profile.last_name || '',
                            email: profile.email || '',
                            avatar_url: profile.avatar_url || null,
                            role: 'participant',
                        });
                    }
                }
            } catch {
                // If lookup fails, still open modal without pre-fill
                participants.push({
                    user_id: otherUserId,
                    first_name: '',
                    last_name: '',
                    email: '',
                    avatar_url: null,
                    role: 'participant',
                });
            }
        }

        setCallParticipants(participants);
        setCallModalOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCallModalClose = useCallback(() => {
        setCallModalOpen(false);
        setCallParticipants([]);
    }, []);

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
                onCallClick={handleCallClick}
            />
            <CallCreationModal
                isOpen={callModalOpen}
                onClose={handleCallModalClose}
                defaultParticipants={callParticipants}
            />
        </ChatSidebarProvider>
    );
}
