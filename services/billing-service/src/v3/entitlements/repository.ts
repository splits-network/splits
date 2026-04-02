/**
 * Entitlements V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { STARTER_ENTITLEMENTS } from '@splits-network/shared-types';
import type { ResolvedEntitlements, PlanTier } from './types.js';

interface SubscriptionPlanRow {
  status: string;
  plan: {
    tier: PlanTier;
    entitlements: Record<string, unknown>;
  };
}

export class EntitlementRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<ResolvedEntitlements> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('status, plan:plans(tier, entitlements)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('EntitlementRepository.findByUserId error:', error);
      return { tier: 'starter', entitlements: STARTER_ENTITLEMENTS, subscription_active: false };
    }

    if (!data?.plan) {
      return { tier: 'starter', entitlements: STARTER_ENTITLEMENTS, subscription_active: false };
    }

    const row = data as unknown as SubscriptionPlanRow;
    return {
      tier: row.plan.tier,
      entitlements: { ...STARTER_ENTITLEMENTS, ...row.plan.entitlements },
      subscription_active: row.status === 'active',
    };
  }
}
