import { createAuthenticatedClient } from "@/lib/api-client";

type ChatContext = {
    application_id?: string | null;
    job_id?: string | null;
    company_id?: string | null;
};

export async function startChatConversation(
    getToken: () => Promise<string | null>,
    participantUserId: string,
    context?: ChatContext,
): Promise<string> {
    const token = await getToken();
    if (!token) {
        throw new Error("Not authenticated");
    }
    const client = createAuthenticatedClient(token);
    // Strip null/undefined values — V3 schema rejects non-UUID strings
    const cleanContext: Record<string, string> = {};
    if (context) {
        for (const [key, value] of Object.entries(context)) {
            if (value) cleanContext[key] = value;
        }
    }
    const response: any = await client.post("/chat/conversations/actions/start", {
        participantUserId,
        context: cleanContext,
    });
    const conversation = response?.data;
    if (!conversation?.id) {
        throw new Error("Failed to start conversation");
    }
    return conversation.id as string;
}

export async function sendChatMessage(
    getToken: () => Promise<string | null>,
    conversationId: string,
    body: string,
): Promise<void> {
    const token = await getToken();
    if (!token) {
        throw new Error("Not authenticated");
    }
    const client = createAuthenticatedClient(token);
    await client.post(`/chat/conversations/${conversationId}/messages`, {
        body,
        client_message_id: crypto.randomUUID(),
    });
}
