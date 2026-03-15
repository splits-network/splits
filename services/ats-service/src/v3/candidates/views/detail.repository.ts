/**
 * Candidate Detail View Repository
 *
 * Returns a single candidate with recruiter_candidates relationships
 * so the service can compute representation status for the requesting user.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidates')
      .select(`
        *,
        recruiter_relationships:recruiter_candidates(
          id,
          recruiter_id,
          status,
          consent_given,
          invitation_expires_at,
          declined_at
        ),
        skills:candidate_skills(skill:skills(id, name))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
