import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyBillingProfile, CompanyBillingProfileCreate, CompanyBillingProfileUpdate } from './types';

interface CompanyBillingProfileListResult {
    data: Array<CompanyBillingProfile & { company?: { id: string; name: string } | null }>;
    total: number;
}

export class CompanyBillingProfileRepository {
    constructor(private supabase: SupabaseClient) { }

    async list(page: number, limit: number): Promise<CompanyBillingProfileListResult> {
        const offset = (page - 1) * limit;
        const { data, error, count } = await this.supabase
            .from('company_billing_profiles')
            .select('*, company:companies(id, name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(`Failed to list billing profiles: ${error.message}`);
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async getByCompanyId(companyId: string): Promise<CompanyBillingProfile | null> {
        const { data, error } = await this.supabase
            .from('company_billing_profiles')
            .select('*')
            .eq('company_id', companyId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to get billing profile: ${error.message}`);
        }

        return data as CompanyBillingProfile;
    }

    async create(profile: CompanyBillingProfileCreate): Promise<CompanyBillingProfile> {
        const { data, error } = await this.supabase
            .from('company_billing_profiles')
            .insert(profile)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to create billing profile: ${error.message}`);
        }

        return data as CompanyBillingProfile;
    }

    async update(companyId: string, updates: CompanyBillingProfileUpdate): Promise<CompanyBillingProfile> {
        const { data, error } = await this.supabase
            .from('company_billing_profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('company_id', companyId)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to update billing profile: ${error.message}`);
        }

        return data as CompanyBillingProfile;
    }

    async upsert(profile: CompanyBillingProfileCreate): Promise<CompanyBillingProfile> {
        const { data, error } = await this.supabase
            .from('company_billing_profiles')
            .upsert(profile, { onConflict: 'company_id' })
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to upsert billing profile: ${error.message}`);
        }

        return data as CompanyBillingProfile;
    }
}
