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
    const response: any = await client.post("/chat/conversations", {
        participantUserId,
        context: context || {},
    });
    const conversation = response?.data;
    if (!conversation?.id) {
        throw new Error("Failed to start conversation");
    }
    return conversation.id as string;
}
