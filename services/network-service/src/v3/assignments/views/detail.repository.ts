/**
 * Assignment Detail View Repository
 * GET /api/v3/assignments/:id/view/detail
 *
 * Returns assignment with recruiter + job + company joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = `
  *,
  recruiter:recruiters(id, name, email),
  job:jobs(id, title, company:companies(id, name))
`;

export class AssignmentDetailViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('role_assignments')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
