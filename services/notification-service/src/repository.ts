import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationLog, NotificationLogInsert } from '@splits-network/shared-types';
import { Logger } from '@splits-network/shared-logging';
import { EmailEntitlementGate, type NotificationChannel } from './helpers/email-entitlement-gate';
import { PreferenceGate } from './helpers/preference-gate';

export class NotificationRepository {
    private supabase: SupabaseClient;
    private _emailGate: EmailEntitlementGate | null = null;
    private _preferenceGate: PreferenceGate | null = null;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    /** Initialize the email entitlement gate (called once at startup) */
    initEmailGate(logger: Logger): void {
        this._emailGate = new EmailEntitlementGate(this.supabase, logger);
    }

    /** Initialize the user preference gate (called once at startup) */
    initPreferenceGate(logger: Logger): void {
        this._preferenceGate = new PreferenceGate(this.supabase, logger);
    }

    /** Check whether email is allowed for a user and resolve the effective channel */
    async resolveChannel(
        recipientUserId: string | null | undefined,
        requestedChannel: NotificationChannel,
    ): Promise<NotificationChannel | null> {
        if (!this._emailGate) return requestedChannel;
        return this._emailGate.resolveChannel(recipientUserId, requestedChannel);
    }

    /**
     * Resolve channel with both entitlement gating and user preference gating.
     * Chain: requested channel -> entitlement gate -> preference gate -> send
     */
    async resolveChannelWithPreferences(
        recipientUserId: string | null | undefined,
        requestedChannel: NotificationChannel,
        category: string | null | undefined,
    ): Promise<NotificationChannel | null> {
        // Step 1: Entitlement gating
        const afterEntitlement = await this.resolveChannel(recipientUserId, requestedChannel);
        if (!afterEntitlement) return null;

        // Step 2: User preference gating
        if (!this._preferenceGate) return afterEntitlement;
        return this._preferenceGate.resolveChannel(recipientUserId, afterEntitlement, category);
    }

    // Expose Supabase client for cross-schema queries
    get supabaseClient(): SupabaseClient {
        return this.supabase;
    }

    // Health check
    async healthCheck(): Promise<void> {
        // Simple query to verify database connectivity
        const { error } = await this.supabase

            .from('notification_log')
            .select('id')
            .limit(1);

        if (error) {
            throw new Error(`Database health check failed: ${error.message}`);
        }
    }

    async createNotificationLog(
        log: NotificationLogInsert
    ): Promise<NotificationLog> {
        const { data, error } = await this.supabase
            .from('notification_log')
            .insert(log)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateNotificationLog(
        id: string,
        updates: Partial<NotificationLog>
    ): Promise<NotificationLog> {
        const { data, error } = await this.supabase
            .from('notification_log')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Get in-app notifications for a user (unread first, then by date)
    async findInAppNotificationsByUserId(
        userId: string,
        options?: {
            unreadOnly?: boolean;
            limit?: number;
            offset?: number;
        }
    ): Promise<NotificationLog[]> {
        const { unreadOnly = false, limit = 50, offset = 0 } = options || {};

        let query = this.supabase

            .from('notification_log')
            .select('*')
            .eq('recipient_user_id', userId)
            .in('channel', ['in_app', 'both'])
            .eq('dismissed', false);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        query = query
            .order('read', { ascending: true })  // unread first
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    // Get unread count for badge
    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await this.supabase

            .from('notification_log')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_user_id', userId)
            .in('channel', ['in_app', 'both'])
            .eq('read', false)
            .eq('dismissed', false);

        if (error) throw error;
        return count || 0;
    }

    // Mark notification as read
    async markAsRead(notificationId: string, userId: string): Promise<NotificationLog> {
        const { data, error } = await this.supabase

            .from('notification_log')
            .update({
                read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', notificationId)
            .eq('recipient_user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Mark all notifications as read
    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await this.supabase

            .from('notification_log')
            .update({
                read: true,
                read_at: new Date().toISOString()
            })
            .eq('recipient_user_id', userId)
            .in('channel', ['in_app', 'both'])
            .eq('read', false);

        if (error) throw error;
    }

    // Dismiss notification
    async dismissNotification(notificationId: string, userId: string): Promise<NotificationLog> {
        const { data, error } = await this.supabase

            .from('notification_log')
            .update({ dismissed: true })
            .eq('id', notificationId)
            .eq('recipient_user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Legacy method - keep for backwards compatibility
    async findNotificationsByUserId(userId: string, limit = 50): Promise<NotificationLog[]> {
        const { data, error } = await this.supabase
            .from('notification_log')
            .select('*')
            .eq('recipient_user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
}




