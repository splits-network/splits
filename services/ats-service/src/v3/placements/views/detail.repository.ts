/**
 * Placement Detail View Repository
 *
 * Returns a single placement with all joined data:
 * candidate, job (with company), and splits (with recruiter + user).
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class PlacementDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placements')
      .select(`
        *,
        candidate:candidates(id, full_name, email),
        job:jobs(id, title, company:companies(id, name, logo_url, identity_organization_id)),
        splits:placement_splits(id, role, split_percentage, split_amount, recruiter_id, recruiter:recruiters(id, user:users!recruiters_user_id_fkey(name)))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
