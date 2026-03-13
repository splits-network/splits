/**
 * Detail View Repository
 * Recruiter-candidate with candidate user details and recruiter user details
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class DetailViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates')
      .select(`
        *,
        candidate:candidates!candidate_id!inner(id, user_id, email, full_name, phone, location, linkedin_url, user:users!candidates_user_id_fkey(name, email)),
        recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users!recruiters_user_id_fkey(name, email))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
