import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Webhook Repository V2
 * Handles webhook-related database operations
 */
export class WebhookRepositoryV2 {
    constructor(
        private supabase: SupabaseClient
    ) {}

    /**
     * Log webhook event for debugging and audit purposes
     */
    async logWebhookEvent(
        eventType: string,
        eventId: string,
        status: 'processing' | 'completed' | 'failed',
        data?: Record<string, any>,
        error?: string
    ) {
        const { data: webhook_log, error: db_error } = await this.supabase
            .from('webhook_logs')
            .insert({
                event_type: eventType,
                event_id: eventId,
                status,
                data,
                error,
                processed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (db_error) {
            throw new Error(`Failed to log webhook: ${db_error.message}`);
        }

        return webhook_log;
    }

    /**
     * Check if webhook event has already been processed (idempotency)
     */
    async isEventProcessed(eventId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('webhook_logs')
            .select('id')
            .eq('event_id', eventId)
            .eq('status', 'completed')
            .limit(1);

        if (error) {
            throw new Error(`Failed to check event status: ${error.message}`);
        }

        return data && data.length > 0;
    }

    /**
     * Get recent webhook logs for debugging
     */
    async getWebhookLogs(limit: number = 50): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('webhook_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to fetch webhook logs: ${error.message}`);
        }

        return data || [];
    }
}