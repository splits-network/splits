import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    Notification,
    NotificationCreateInput,
    NotificationFilters,
    NotificationUpdate,
} from './types';

export class NotificationRepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): Notification {
        return {
            id: row.id,
            event_type: row.event_type,
            recipient_email: row.recipient_email,
            recipient_user_id: row.recipient_user_id || undefined,
            subject: row.subject,
            template: row.template,
            payload: row.payload,
            channel: row.channel,
            status: row.status,
            read: row.read,
            read_at: row.read_at,
            dismissed: row.dismissed,
            action_url: row.action_url,
            action_label: row.action_label,
            priority: row.priority || 'normal',
            category: row.category,
            resend_message_id: row.resend_message_id,
            error_message: row.error_message,
            sent_at: row.sent_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findNotifications(filters: NotificationFilters = {}): Promise<{
        data: Notification[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('notifications')
            .from('notification_log')
            .select('*', { count: 'exact' });

        if (filters.event_type) {
            query = query.eq('event_type', filters.event_type);
        }
        if (filters.recipient_user_id) {
            query = query.eq('recipient_user_id', filters.recipient_user_id);
        }
        if (filters.channel) {
            query = query.eq('channel', filters.channel);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters.unread_only) {
            query = query.eq('read', false);
        }
        if (filters.search) {
            query = query.ilike('subject', `%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findNotification(id: string): Promise<Notification | null> {
        const { data, error } = await this.supabase
            .schema('notifications')
            .from('notification_log')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createNotification(input: NotificationCreateInput): Promise<Notification> {
        const { data, error } = await this.supabase
            .schema('notifications')
            .from('notification_log')
            .insert({
                event_type: input.event_type,
                recipient_email: input.recipient_email,
                recipient_user_id: input.recipient_user_id,
                subject: input.subject,
                template: input.template || 'custom',
                payload: input.payload || {},
                channel: input.channel || 'email',
                status: input.status || 'pending',
                read: false,
                dismissed: false,
                priority: input.priority || 'normal',
                category: input.category,
                action_url: input.action_url,
                action_label: input.action_label,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateNotification(id: string, updates: NotificationUpdate): Promise<Notification> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.status !== 'undefined') {
            payload.status = updates.status;
            if (updates.status === 'sent' && !updates.sent_at) {
                payload.sent_at = new Date().toISOString();
            }
        }

        if (typeof updates.read !== 'undefined') {
            payload.read = updates.read;
            payload.read_at = updates.read ? new Date().toISOString() : null;
        }

        if (typeof updates.dismissed !== 'undefined') {
            payload.dismissed = updates.dismissed;
        }

        if (typeof updates.priority !== 'undefined') {
            payload.priority = updates.priority;
        }

        if (typeof updates.action_url !== 'undefined') {
            payload.action_url = updates.action_url;
        }

        if (typeof updates.action_label !== 'undefined') {
            payload.action_label = updates.action_label;
        }

        if (typeof updates.category !== 'undefined') {
            payload.category = updates.category;
        }

        if (typeof updates.payload !== 'undefined') {
            payload.payload = updates.payload;
        }

        if (typeof updates.error_message !== 'undefined') {
            payload.error_message = updates.error_message;
        }

        if (typeof updates.resend_message_id !== 'undefined') {
            payload.resend_message_id = updates.resend_message_id;
        }

        if (typeof updates.sent_at !== 'undefined') {
            payload.sent_at = updates.sent_at;
        }

        const { data, error } = await this.supabase
            .schema('notifications')
            .from('notification_log')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async dismissNotification(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('notifications')
            .from('notification_log')
            .update({
                dismissed: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
