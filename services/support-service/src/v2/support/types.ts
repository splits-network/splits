export type SupportConversationStatus = 'open' | 'waiting_on_visitor' | 'waiting_on_admin' | 'resolved' | 'closed';
export type SupportCategory = 'feedback' | 'issue' | 'error' | 'question';
export type SupportSenderType = 'visitor' | 'admin' | 'system';

export interface SupportConversation {
    id: string;
    visitor_session_id: string;
    clerk_user_id: string | null;
    user_id: string | null;
    visitor_name: string | null;
    visitor_email: string | null;
    source_app: 'portal' | 'candidate' | 'corporate';
    assigned_admin_id: string | null;
    status: SupportConversationStatus;
    category: SupportCategory | null;
    subject: string | null;
    page_url: string | null;
    user_agent: string | null;
    resolved_at: string | null;
    last_message_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SupportMessage {
    id: string;
    conversation_id: string;
    sender_type: SupportSenderType;
    sender_id: string | null;
    body: string;
    metadata: Record<string, any> | null;
    created_at: string;
}

export interface CreateConversationInput {
    sessionId: string;
    clerkUserId?: string;
    category?: SupportCategory;
    subject?: string;
    body: string;
    visitorName?: string;
    visitorEmail?: string;
    sourceApp: 'portal' | 'candidate' | 'corporate';
    pageUrl?: string;
    userAgent?: string;
}

export interface SendMessageInput {
    body: string;
}

export interface UpdateConversationInput {
    status?: SupportConversationStatus;
    assigned_admin_id?: string;
}
