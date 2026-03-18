/**
 * Candidate Skills "with-details" View Repository
 *
 * Joins candidate_skills with skills to include skill name/slug.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_DETAILS_SELECT = '*, skill:skills(*)';

export class WithDetailsCandidateSkillRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByCandidateId(candidateId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('candidate_skills')
      .select(WITH_DETAILS_SELECT)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
