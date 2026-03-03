import { SupabaseClient } from '@supabase/supabase-js';

export class JobSkillRepository {
    constructor(private supabase: SupabaseClient) {}

    async listByJobId(jobId: string) {
        const { data, error } = await this.supabase
            .from('job_skills')
            .select('*, skill:skills(*)')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async add(jobId: string, skillId: string, isRequired: boolean = true) {
        const { data, error } = await this.supabase
            .from('job_skills')
            .upsert({ job_id: jobId, skill_id: skillId, is_required: isRequired })
            .select('*, skill:skills(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async remove(jobId: string, skillId: string) {
        const { error } = await this.supabase
            .from('job_skills')
            .delete()
            .eq('job_id', jobId)
            .eq('skill_id', skillId);

        if (error) throw error;
    }

    async bulkReplace(jobId: string, skills: Array<{ skill_id: string; is_required: boolean }>) {
        // Delete all existing skills for this job
        const { error: deleteError } = await this.supabase
            .from('job_skills')
            .delete()
            .eq('job_id', jobId);

        if (deleteError) throw deleteError;

        if (skills.length === 0) return [];

        // Insert new skills
        const rows = skills.map(s => ({
            job_id: jobId,
            skill_id: s.skill_id,
            is_required: s.is_required,
        }));

        const { data, error } = await this.supabase
            .from('job_skills')
            .insert(rows)
            .select('*, skill:skills(*)');

        if (error) throw error;
        return data || [];
    }
}
