/**
 * Recruiter-Code Detail View Repository
 * GET /api/v3/recruiter-codes/:id/view/detail
 *
 * Returns a recruiter code with recruiter/user joins and usage count.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = '*, recruiter:recruiters!inner(id, user:users!recruiters_user_id_fkey!inner(name, email))';

export class RecruiterCodeDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_codes')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async getUsageCount(codeId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('recruiter_codes_log')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_code_id', codeId);
    if (error) throw error;
    return count || 0;
  }
}
