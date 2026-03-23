/**
 * My Subscription View Repository
 *
 * Joins subscriptions with plans to include plan details.
 * Used by the /me endpoint to return the user's active subscription with plan info.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_PLAN_SELECT = '*, plan:plans(*)';

export class MySubscriptionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select(WITH_PLAN_SELECT)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
