/**
 * Detail View Repository
 * Joins: recruiter with user details (name, email)
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = `
  *,
  recruiter:recruiters!inner(
    id,
    user:users!recruiters_user_id_fkey!inner(name, email)
  )
`;

export class CompanyInvitationDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_company_invitations')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
