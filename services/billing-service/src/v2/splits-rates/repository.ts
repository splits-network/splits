import { SupabaseClient } from '@supabase/supabase-js';
import { SplitsRate, SplitsRateWithPlan, SplitsRateCreateInput } from './types';

export class SplitsRateRepository {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Get all currently active rates (one per plan), joined with plan info.
     */
    async getActiveRates(): Promise<SplitsRateWithPlan[]> {
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

    /**
     * Get the active rate for a specific plan.
     */
    async getActiveRateByPlanId(planId: string): Promise<SplitsRateWithPlan | null> {
        const { data, error } = await this.supabase
            .from('splits_rates')
            .select('*, plans!inner(tier, name)')
            .eq('plan_id', planId)
            .is('effective_to', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return {
            ...data,
            plan_tier: data.plans.tier,
            plan_name: data.plans.name,
            plans: undefined,
        };
    }

    /**
     * Get the active rate by plan tier (starter/pro/partner).
     * Used by placement snapshot service for backward compatibility.
     */
    async getActiveRateByTier(tier: string): Promise<SplitsRateWithPlan | null> {
        const { data, error } = await this.supabase
            .from('splits_rates')
            .select('*, plans!inner(tier, name)')
            .eq('plans.tier', tier)
            .is('effective_to', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return {
            ...data,
            plan_tier: data.plans.tier,
            plan_name: data.plans.name,
            plans: undefined,
        };
    }

    /**
     * Deactivate the current rate for a plan and insert a new one.
     * Returns the newly created rate.
     */
    async createRate(input: SplitsRateCreateInput): Promise<SplitsRate> {
        // Deactivate current active rate for this plan
        const { error: deactivateError } = await this.supabase
            .from('splits_rates')
            .update({ effective_to: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('plan_id', input.plan_id)
            .is('effective_to', null);

        if (deactivateError) throw deactivateError;

        // Insert new active rate
        const { data, error } = await this.supabase
            .from('splits_rates')
            .insert(input)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }
}
