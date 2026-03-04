import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyPerkRepository {
    constructor(private supabase: SupabaseClient) {}

    async listByCompanyId(companyId: string) {
        const { data, error } = await this.supabase
            .from('company_perks')
            .select('*, perk:perks(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async bulkReplace(companyId: string, perks: Array<{ perk_id: string }>) {
        // Delete all existing perks for this company
        const { error: deleteError } = await this.supabase
            .from('company_perks')
            .delete()
            .eq('company_id', companyId);

        if (deleteError) throw deleteError;

        if (perks.length === 0) return [];

        // Insert new perks
        const rows = perks.map(p => ({
            company_id: companyId,
            perk_id: p.perk_id,
        }));

        const { data, error } = await this.supabase
            .from('company_perks')
            .insert(rows)
            .select('*, perk:perks(*)');

        if (error) throw error;
        return data || [];
    }
}
