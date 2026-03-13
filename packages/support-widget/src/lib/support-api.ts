export interface SupportConversation {
    id: string;
    visitor_session_id: string;
    status: string;
    category: string | null;
    subject: string | null;
    last_message_at: string | null;
    created_at: string;
}

export interface SupportMessage {
    id: string;
    conversation_id: string;
    sender_type: 'visitor' | 'admin' | 'system';
    body: string;
    created_at: string;
}

export interface SupportApiConfig {
    baseUrl: string;
    sessionId: string;
    getToken?: () => Promise<string | null>;
}

async function buildHeaders(config: SupportApiConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-support-session-id': config.sessionId,
    };

    if (config.getToken) {
        try {
            const token = await config.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch {
            // Continue without auth
        }
    }

    return headers;
}

export async function checkAdminStatus(baseUrl: string): Promise<boolean> {
    const res = await fetch(`${baseUrl}/api/v3/public/support/admin-status`);
    const json = await res.json();
    return json.data?.online ?? false;
}

export async function createConversation(
    config: SupportApiConfig,
    input: {
        body: string;
        category?: string;
        subject?: string;
        visitorName?: string;
        visitorEmail?: string;
        sourceApp: string;
        pageUrl?: string;
        userAgent?: string;
    },
): Promise<{ conversation: SupportConversation; message: SupportMessage }> {
    const headers = await buildHeaders(config);
    const res = await fetch(`${config.baseUrl}/api/v3/support/conversations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            session_id: config.sessionId,
            body: input.body,
            category: input.category,
            subject: input.subject,
            visitor_name: input.visitorName,
            visitor_email: input.visitorEmail,
            source_app: input.sourceApp,
            page_url: input.pageUrl,
            user_agent: input.userAgent,
        }),
    });

    if (!res.ok) throw new Error('Failed to create conversation');
    const json = await res.json();
    return json.data;
}

export async function sendMessage(
    config: SupportApiConfig,
    conversationId: string,
    body: string,
): Promise<SupportMessage> {
    const headers = await buildHeaders(config);
    const res = await fetch(
        `${config.baseUrl}/api/v3/support/conversations/${conversationId}/messages`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify({ body }),
        },
    );

    if (!res.ok) throw new Error('Failed to send message');
    const json = await res.json();
    return json.data;
}

export async function getMyConversations(
    config: SupportApiConfig,
): Promise<SupportConversation[]> {
    const headers = await buildHeaders(config);
    const res = await fetch(
        `${config.baseUrl}/api/v3/support/conversations/mine?sessionId=${config.sessionId}`,
        { headers },
    );

    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
}

export interface SupportTicket {
    id: string;
    status: string;
    category: string;
    subject: string | null;
    body: string;
    created_at: string;
}

export async function createTicket(
    config: SupportApiConfig,
    input: {
        body: string;
        category?: string;
        subject?: string;
        visitorName?: string;
        visitorEmail?: string;
        sourceApp: string;
        pageUrl?: string;
        userAgent?: string;
    },
): Promise<SupportTicket> {
    const headers = await buildHeaders(config);
    const res = await fetch(`${config.baseUrl}/api/v3/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            session_id: config.sessionId,
            body: input.body,
            category: input.category,
            subject: input.subject,
            visitor_name: input.visitorName,
            visitor_email: input.visitorEmail,
            source_app: input.sourceApp,
            page_url: input.pageUrl,
            user_agent: input.userAgent,
        }),
    });

    if (!res.ok) throw new Error('Failed to create ticket');
    const json = await res.json();
    return json.data;
}

export async function linkSession(config: SupportApiConfig): Promise<void> {
    const headers = await buildHeaders(config);
    await fetch(`${config.baseUrl}/api/v3/support/conversations/link-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
    }).catch(() => {
        // Best-effort linking
    });
}

export async function getMessages(
    config: SupportApiConfig,
    conversationId: string,
): Promise<SupportMessage[]> {
    const headers = await buildHeaders(config);
    const res = await fetch(
        `${config.baseUrl}/api/v3/support/conversations/${conversationId}/messages`,
        { headers },
    );

    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
}
