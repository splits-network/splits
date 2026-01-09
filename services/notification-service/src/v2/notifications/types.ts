/**
 * Notification Domain Types
 */

export type NotificationChannel = 'email' | 'in_app' | 'both';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
    id: string;
    event_type: string;
    recipient_email: string;
    recipient_user_id?: string;
    subject: string;
    template: string;
    payload?: Record<string, any> | null;
    channel: NotificationChannel;
    status: NotificationStatus;
    read: boolean;
    read_at?: string | null;
    dismissed: boolean;
    action_url?: string | null;
    action_label?: string | null;
    priority: NotificationPriority;
    category?: string | null;
    resend_message_id?: string | null;
    error_message?: string | null;
    sent_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationFilters {
    event_type?: string;
    recipient_user_id?: string;
    channel?: NotificationChannel;
    status?: NotificationStatus;
    category?: string;
    priority?: NotificationPriority;
    unread_only?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
}

export interface NotificationCreateInput {
    event_type: string;
    recipient_email: string;
    recipient_user_id?: string;
    subject: string;
    template?: string;
    payload?: Record<string, any>;
    channel?: NotificationChannel;
    status?: NotificationStatus;
    priority?: NotificationPriority;
    category?: string;
    action_url?: string;
    action_label?: string;
}

export type NotificationUpdate = Partial<
    Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'recipient_email'>
>;
