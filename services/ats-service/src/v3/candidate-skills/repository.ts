/**
 * Candidate Skills V3 Repository — Junction CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateSkillRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCandidateId(candidateId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('candidate_skills')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('candidate_skills')
      .upsert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(candidateId: string, skillId: string): Promise<void> {
    const { error } = await this.supabase
      .from('candidate_skills')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('skill_id', skillId);

    if (error) throw error;
  }

  async bulkReplace(
    candidateId: string,
    skills: Array<{ skill_id: string }>
  ): Promise<any[]> {
    const { error: deleteError } = await this.supabase
      .from('candidate_skills')
      .delete()
      .eq('candidate_id', candidateId);

    if (deleteError) throw deleteError;
    if (skills.length === 0) return [];

    const rows = skills.map(s => ({
      candidate_id: candidateId,
      skill_id: s.skill_id,
    }));

    const { data, error } = await this.supabase
      .from('candidate_skills')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
