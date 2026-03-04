import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyCultureTagRepository {
    constructor(private supabase: SupabaseClient) {}

    async listByCompanyId(companyId: string) {
        const { data, error } = await this.supabase
            .from('company_culture_tags')
            .select('*, culture_tag:culture_tags(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async bulkReplace(companyId: string, cultureTags: Array<{ culture_tag_id: string }>) {
        // Delete all existing culture tags for this company
        const { error: deleteError } = await this.supabase
            .from('company_culture_tags')
            .delete()
            .eq('company_id', companyId);

        if (deleteError) throw deleteError;

        if (cultureTags.length === 0) return [];

        // Insert new culture tags
        const rows = cultureTags.map(ct => ({
            company_id: companyId,
            culture_tag_id: ct.culture_tag_id,
        }));

        const { data, error } = await this.supabase
            .from('company_culture_tags')
            .insert(rows)
            .select('*, culture_tag:culture_tags(*)');

        if (error) throw error;
        return data || [];
    }
}
