/**
 * Invitation Detail View Repository
 * GET /api/v3/invitations/:id/view/detail
 * GET /api/v3/invitations/views/detail
 *
 * Returns invitation(s) with joined organization and company data.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = '*, organizations(*), companies(*)';

export class InvitationDetailViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    organization_id?: string;
    company_id?: string;
    email?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('invitations')
      .select(DETAIL_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (params.organization_id) query = query.eq('organization_id', params.organization_id);
    if (params.company_id !== undefined) {
      if (params.company_id === null) {
        query = query.is('company_id', null);
      } else {
        query = query.eq('company_id', params.company_id);
      }
    }
    if (params.email) query = query.eq('email', params.email);
    if (params.status) query = query.eq('status', params.status);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
