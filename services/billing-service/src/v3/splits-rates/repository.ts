/**
 * Splits Rates V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class SplitsRateRepository {
  constructor(private supabase: SupabaseClient) {}

  async getActiveRates(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('splits_rates')
      .select('*, plans!inner(tier, name)')
      .is('effective_to', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      plan_tier: row.plans.tier,
      plan_name: row.plans.name,
      plans: undefined,
    }));
  }

  async getActiveRateByPlanId(planId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('splits_rates')
      .select('*, plans!inner(tier, name)')
      .eq('plan_id', planId)
      .is('effective_to', null)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      plan_tier: data.plans.tier,
      plan_name: data.plans.name,
      plans: undefined,
    };
  }

  async getActiveRateByTier(tier: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('splits_rates')
      .select('*, plans!inner(tier, name)')
      .eq('plans.tier', tier)
      .is('effective_to', null)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      plan_tier: data.plans.tier,
      plan_name: data.plans.name,
      plans: undefined,
    };
  }

  async createRate(input: Record<string, any>): Promise<any> {
    // Deactivate current active rate for this plan
    const { error: deactivateError } = await this.supabase
      .from('splits_rates')
      .update({ effective_to: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('plan_id', input.plan_id)
      .is('effective_to', null);

    if (deactivateError) throw deactivateError;

    const { data, error } = await this.supabase
      .from('splits_rates')
      .insert(input)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
