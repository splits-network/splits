/**
 * Discounts V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class DiscountRepository {
  constructor(private supabase: SupabaseClient) {}

  async findDiscountBySubscriptionId(subscriptionId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('subscription_discounts')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createDiscount(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('subscription_discounts')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDiscount(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('subscription_discounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('subscription_id', subscriptionId);

    if (error) throw error;
  }

  async isPromotionCodeUsedByUser(identityUserId: string, promotionCodeId: string): Promise<boolean> {
    const { data: subscriptions } = await this.supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', identityUserId);

    if (!subscriptions || subscriptions.length === 0) return false;

    const { data } = await this.supabase
      .from('subscription_discounts')
      .select('id')
      .in('subscription_id', subscriptions.map(s => s.id))
      .eq('stripe_promotion_code_id', promotionCodeId)
      .is('deleted_at', null)
      .maybeSingle();

    return !!data;
  }
}
