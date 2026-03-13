/**
 * Webhooks V3 Repository - Health check queries
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class WebhookRepository {
  constructor(private supabase: SupabaseClient) {}

  async getHealthStatus() {
    const { count, error } = await this.supabase.from('stripe_webhook_events')
      .select('id', { count: 'exact', head: true }).eq('processing_status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    return { recent_failures: count || 0 };
  }
}
