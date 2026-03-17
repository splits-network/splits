/**
 * Webhook Events V3 Repository - Event storage + status tracking
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class WebhookEventRepository {
  constructor(private supabase: SupabaseClient) {}

  async store(event: { stripe_event_id: string; event_type: string; api_version: string | null; livemode: boolean; payload: Record<string, any> }) {
    const { data, error } = await this.supabase.from('stripe_webhook_events')
      .upsert({ ...event, processing_status: 'pending' }, { onConflict: 'stripe_event_id', ignoreDuplicates: true }).select().single();
    if (error) {
      if (error.code === 'PGRST116') {
        const { data: existing } = await this.supabase.from('stripe_webhook_events').select().eq('stripe_event_id', event.stripe_event_id).single();
        if (existing) return { isNew: false, record: existing };
      }
      throw error;
    }
    return { isNew: true, record: data };
  }

  async updateStatus(stripeEventId: string, status: string, errorMsg?: string) {
    const updates: Record<string, any> = { processing_status: status };
    if (status !== 'pending' && status !== 'processing') updates.processed_at = new Date().toISOString();
    if (errorMsg) updates.processing_error = errorMsg;
    await this.supabase.from('stripe_webhook_events').update(updates).eq('stripe_event_id', stripeEventId);
  }

  async list(params: { page?: number; limit?: number; status?: string; event_type?: string }) {
    const { page = 1, limit = 25 } = params;
    const offset = (page - 1) * limit;
    let query = this.supabase.from('stripe_webhook_events').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (params.status) query = query.eq('processing_status', params.status);
    if (params.event_type) query = query.eq('event_type', params.event_type);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
