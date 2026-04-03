import { SupportCategory } from '../support/types.js';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
    id: string;
    conversation_id: string | null;
    visitor_session_id: string;
    clerk_user_id: string | null;
    user_id: string | null;
    visitor_name: string | null;
    visitor_email: string | null;
    source_app: 'portal' | 'candidate' | 'corporate';
    assigned_admin_id: string | null;
    status: SupportTicketStatus;
    category: SupportCategory;
    subject: string | null;
    body: string;
    page_url: string | null;
    user_agent: string | null;
    admin_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SupportTicketReply {
    id: string;
    ticket_id: string;
    sender_type: 'admin' | 'system';
    sender_id: string | null;
    body: string;
    created_at: string;
}

export interface CreateTicketInput {
    sessionId: string;
    clerkUserId?: string;
    category: SupportCategory;
    subject?: string;
    body: string;
    visitorName?: string;
    visitorEmail?: string;
    sourceApp: 'portal' | 'candidate' | 'corporate';
    pageUrl?: string;
    userAgent?: string;
}
