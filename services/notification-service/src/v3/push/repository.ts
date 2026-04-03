/**
 * Push Subscription V3 Repository — Core CRUD
 *
 * Single table queries on push_subscriptions. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PushSubscriptionRecord } from './types.js';

export class PushSubscriptionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<PushSubscriptionRecord[]> {
    const { data, error } = await this.supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscriptionRecord | null> {
    const { data, error } = await this.supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsert(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    userAgent?: string,
  ): Promise<PushSubscriptionRecord> {
    const { data, error } = await this.supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint,
          p256dh,
          auth,
          user_agent: userAgent || null,
          last_used_at: null,
        },
        { onConflict: 'endpoint' },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteByEndpoint(userId: string, endpoint: string): Promise<void> {
    const { error } = await this.supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) throw error;
  }

  async deleteByEndpoints(endpoints: string[]): Promise<void> {
    if (endpoints.length === 0) return;
    const { error } = await this.supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', endpoints);

    if (error) throw error;
  }

  async updateLastUsed(endpoints: string[]): Promise<void> {
    if (endpoints.length === 0) return;
    const { error } = await this.supabase
      .from('push_subscriptions')
      .update({ last_used_at: new Date().toISOString() })
      .in('endpoint', endpoints);

    if (error) throw error;
  }
}
