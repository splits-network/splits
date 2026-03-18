/**
 * Firm Members View Repository
 * GET /api/v3/firms/:firmId/views/members
 *
 * Returns firm members with recruiter + user joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { FirmMemberListParams } from '../types';

const MEMBER_SELECT = `
  *, recruiter:recruiters!inner(id, user_id, status, user:users!recruiters_user_id_fkey(id, name, email))
`;

export class FirmMembersViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMembers(firmId: string, params: FirmMemberListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('firm_members')
      .select(MEMBER_SELECT, { count: 'exact' })
      .eq('firm_id', firmId);

    if (params.status) query = query.eq('status', params.status);
    if (params.role) query = query.eq('role', params.role);
    query = query.order('joined_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
