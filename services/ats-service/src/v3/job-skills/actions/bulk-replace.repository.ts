/**
 * Bulk Replace Job Skills Action Repository
 * Atomic delete all + insert new skills
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface BulkSkillItem {
  skill_id: string;
  is_required: boolean;
}

export class BulkReplaceSkillsRepository {
  constructor(private supabase: SupabaseClient) {}

  async bulkReplace(jobId: string, skills: BulkSkillItem[]): Promise<any[]> {
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
      .select('*, skill:skills(id, name, slug)');

    if (error) throw error;
    return data || [];
  }
}
