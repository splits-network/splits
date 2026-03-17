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
import type { LinkableEntityType } from "@/components/calls/entity-linker";

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
    const [callEntityType, setCallEntityType] = useState<LinkableEntityType | undefined>();
    const [callEntityId, setCallEntityId] = useState<string | undefined>();
    const [callEntityLabel, setCallEntityLabel] = useState<string | undefined>();

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

    const handleCallClick = useCallback(async (
        otherUserId: string | null,
        otherUserDetails?: {
            name: string | null;
            email: string;
            profile_image_url?: string | null;
        } | null,
        entityContext?: {
            application_id?: string | null;
            job_id?: string | null;
            company_id?: string | null;
            candidate_id?: string | null;
        },
    ) => {
        const participants: Participant[] = [];

        // Use participant details from conversation data (passed by chat header)
        if (otherUserId) {
            const nameParts = (otherUserDetails?.name || '').split(' ');
            participants.push({
                user_id: otherUserId,
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || '',
                email: otherUserDetails?.email || '',
                avatar_url: otherUserDetails?.profile_image_url || null,
                role: 'participant',
            });
        }

        // Resolve entity context from the chat conversation
        let entityType: LinkableEntityType | undefined;
        let entityId: string | undefined;
        let entityLabel: string | undefined;

        if (entityContext) {
            try {
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    if (entityContext.application_id) {
                        entityType = 'application';
                        entityId = entityContext.application_id;
                        const res: any = await client.get(`/applications/${entityId}/view/detail`);
                        const app = res?.data;
                        entityLabel = app?.job?.title
                            ? `${app.job.title}${app.candidate?.full_name ? ` — ${app.candidate.full_name}` : ''}`
                            : 'Application';
                    } else if (entityContext.job_id) {
                        entityType = 'job';
                        entityId = entityContext.job_id;
                        const res: any = await client.get(`/jobs/${entityId}`);
                        entityLabel = res?.data?.title || 'Job';
                    } else if (entityContext.company_id) {
                        entityType = 'company';
                        entityId = entityContext.company_id;
                        const res: any = await client.get(`/companies/${entityId}`);
                        entityLabel = res?.data?.name || 'Company';
                    } else if (entityContext.candidate_id) {
                        entityType = 'candidate';
                        entityId = entityContext.candidate_id;
                        const res: any = await client.get(`/candidates/${entityId}`);
                        entityLabel = res?.data?.full_name || 'Candidate';
                    }
                }
            } catch {
                // If entity lookup fails, open modal without entity pre-fill
            }
        }

        setCallParticipants(participants);
        setCallEntityType(entityType);
        setCallEntityId(entityId);
        setCallEntityLabel(entityLabel);
        setCallModalOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCallModalClose = useCallback(() => {
        setCallModalOpen(false);
        setCallParticipants([]);
        setCallEntityType(undefined);
        setCallEntityId(undefined);
        setCallEntityLabel(undefined);
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
                defaultEntityType={callEntityType}
                defaultEntityId={callEntityId}
                defaultEntityLabel={callEntityLabel}
            />
        </ChatSidebarProvider>
    );
}
