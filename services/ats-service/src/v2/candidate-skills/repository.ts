import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateSkillRepository {
    constructor(private supabase: SupabaseClient) {}

    async listByCandidateId(candidateId: string) {
        const { data, error } = await this.supabase
            .from('candidate_skills')
            .select('*, skill:skills(*)')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async add(candidateId: string, skillId: string, source: string = 'manual') {
        const { data, error } = await this.supabase
            .from('candidate_skills')
            .upsert({ candidate_id: candidateId, skill_id: skillId, source })
            .select('*, skill:skills(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async remove(candidateId: string, skillId: string) {
        const { error } = await this.supabase
            .from('candidate_skills')
            .delete()
            .eq('candidate_id', candidateId)
            .eq('skill_id', skillId);

        if (error) throw error;
    }

    async bulkReplace(candidateId: string, skills: Array<{ skill_id: string; source?: string }>) {
        // Delete all existing skills for this candidate
        const { error: deleteError } = await this.supabase
            .from('candidate_skills')
            .delete()
            .eq('candidate_id', candidateId);

        if (deleteError) throw deleteError;

        if (skills.length === 0) return [];

        // Insert new skills
        const rows = skills.map(s => ({
            candidate_id: candidateId,
            skill_id: s.skill_id,
            source: s.source || 'manual',
        }));

        const { data, error } = await this.supabase
            .from('candidate_skills')
            .insert(rows)
            .select('*, skill:skills(*)');

        if (error) throw error;
        return data || [];
    }
}
