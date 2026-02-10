import { SupabaseClient } from '@supabase/supabase-js';

export type ProcessingStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'skipped';

export interface WebhookEventRecord {
    id: string;
    stripe_event_id: string;
    event_type: string;
    api_version: string | null;
    livemode: boolean;
    payload: Record<string, any>;
    processing_status: ProcessingStatus;
    processing_error: string | null;
    processed_at: string | null;
    created_at: string;
}

export class WebhookEventRepository {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Store event and return true if this is a new event.
     * Returns false if the event was already stored (duplicate).
     */
    async store(event: {
        stripe_event_id: string;
        event_type: string;
        api_version: string | null;
        livemode: boolean;
        payload: Record<string, any>;
    }): Promise<{ isNew: boolean; record: WebhookEventRecord }> {
        const { data, error } = await this.supabase
            .from('stripe_webhook_events')
            .upsert(
                {
                    stripe_event_id: event.stripe_event_id,
                    event_type: event.event_type,
                    api_version: event.api_version,
                    livemode: event.livemode,
                    payload: event.payload,
                    processing_status: 'pending',
                },
                { onConflict: 'stripe_event_id', ignoreDuplicates: true }
            )
            .select()
            .single();

        if (error) {
            // If the upsert was ignored (duplicate), fetch the existing record
            if (error.code === 'PGRST116') {
                const { data: existing } = await this.supabase
                    .from('stripe_webhook_events')
                    .select()
                    .eq('stripe_event_id', event.stripe_event_id)
                    .single();

                if (existing) {
                    return { isNew: false, record: existing as WebhookEventRecord };
                }
            }
            throw error;
        }

        return { isNew: true, record: data as WebhookEventRecord };
    }

    async markProcessing(stripeEventId: string): Promise<void> {
        await this.supabase
            .from('stripe_webhook_events')
            .update({ processing_status: 'processing' })
            .eq('stripe_event_id', stripeEventId);
    }

    async markSucceeded(stripeEventId: string): Promise<void> {
        await this.supabase
            .from('stripe_webhook_events')
            .update({
                processing_status: 'succeeded',
                processed_at: new Date().toISOString(),
            })
            .eq('stripe_event_id', stripeEventId);
    }

    async markFailed(stripeEventId: string, error: string): Promise<void> {
        await this.supabase
            .from('stripe_webhook_events')
            .update({
                processing_status: 'failed',
                processing_error: error,
                processed_at: new Date().toISOString(),
            })
            .eq('stripe_event_id', stripeEventId);
    }

    async markSkipped(stripeEventId: string, reason: string): Promise<void> {
        await this.supabase
            .from('stripe_webhook_events')
            .update({
                processing_status: 'skipped',
                processing_error: reason,
                processed_at: new Date().toISOString(),
            })
            .eq('stripe_event_id', stripeEventId);
    }
}
