/**
 * V2 Shared Types - Notification Service
 * Type definitions for notifications and email templates
 */

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
    id: string;
    event_type: string;
    recipient_email: string;
    recipient_id: string;
    subject: string;
    body: string;
    template_id: string | null;
    status: 'pending' | 'sent' | 'failed' | 'bounced';
    provider: 'resend' | 'internal';
    provider_id: string | null;
    error_message: string | null;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationFilters {
    event_type?: string;
    recipient_id?: string;
    status?: string;
    provider?: string;
}

export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// EMAIL TEMPLATES
// ============================================

export interface EmailTemplate {
    id: string;
    event_type: string;
    subject: string;
    template_html: string;
    status: 'active' | 'archived' | 'draft';
    variables: string[]; // JSON array of required variables
    created_at: string;
    updated_at: string;
}

export interface TemplateFilters {
    event_type?: string;
    status?: string;
}

export type TemplateUpdate = Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// PAGINATION
// ============================================

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
