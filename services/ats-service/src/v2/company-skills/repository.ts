import { SupabaseClient } from '@supabase/supabase-js';

export class CompanySkillRepository {
    constructor(private supabase: SupabaseClient) {}

    async listByCompanyId(companyId: string) {
        const { data, error } = await this.supabase
            .from('company_skills')
            .select('*, skill:skills(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async bulkReplace(companyId: string, skills: Array<{ skill_id: string }>) {
        // Delete all existing skills for this company
        const { error: deleteError } = await this.supabase
            .from('company_skills')
            .delete()
            .eq('company_id', companyId);

        if (deleteError) throw deleteError;

        if (skills.length === 0) return [];

        // Insert new skills
        const rows = skills.map(s => ({
            company_id: companyId,
            skill_id: s.skill_id,
        }));

        const { data, error } = await this.supabase
            .from('company_skills')
            .insert(rows)
            .select('*, skill:skills(*)');

        if (error) throw error;
        return data || [];
    }
}
