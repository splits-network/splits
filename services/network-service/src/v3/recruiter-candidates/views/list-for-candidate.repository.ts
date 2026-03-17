/**
 * List-for-Candidate View Repository
 *
 * Returns recruiter-candidate relationships scoped to a candidate,
 * with recruiter user details (name, email, user_id for presence).
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class ListForCandidateViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForCandidate(candidateId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates')
      .select(`
        id,
        recruiter_id,
        candidate_id,
        status,
        consent_given,
        consent_given_at,
        declined_at,
        relationship_start_date,
        relationship_end_date,
        invitation_token,
        invitation_expires_at,
        invited_at,
        created_at,
        updated_at,
        recruiter:recruiters!recruiter_id(
          id,
          user_id,
          bio,
          status,
          user:users!recruiters_user_id_fkey(name, email)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
