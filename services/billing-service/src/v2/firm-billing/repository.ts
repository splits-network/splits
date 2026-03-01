import { SupabaseClient } from '@supabase/supabase-js';
import { FirmBillingProfile, FirmBillingProfileCreate, FirmBillingProfileUpdate } from './types';

export class FirmBillingProfileRepository {
    constructor(private supabase: SupabaseClient) { }

    async getByFirmId(firmId: string): Promise<FirmBillingProfile | null> {
        const { data, error } = await this.supabase
            .from('firm_billing_profiles')
            .select('*')
            .eq('firm_id', firmId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to get firm billing profile: ${error.message}`);
        }

        return data as FirmBillingProfile;
    }

    async create(profile: FirmBillingProfileCreate): Promise<FirmBillingProfile> {
        const { data, error } = await this.supabase
            .from('firm_billing_profiles')
            .insert(profile)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to create firm billing profile: ${error.message}`);
        }

        return data as FirmBillingProfile;
    }

    async update(firmId: string, updates: FirmBillingProfileUpdate): Promise<FirmBillingProfile> {
        const { data, error } = await this.supabase
            .from('firm_billing_profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('firm_id', firmId)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to update firm billing profile: ${error.message}`);
        }

        return data as FirmBillingProfile;
    }

    async upsert(profile: FirmBillingProfileCreate): Promise<FirmBillingProfile> {
        const { data, error } = await this.supabase
            .from('firm_billing_profiles')
            .upsert(profile, { onConflict: 'firm_id' })
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to upsert firm billing profile: ${error.message}`);
        }

        return data as FirmBillingProfile;
    }
}
