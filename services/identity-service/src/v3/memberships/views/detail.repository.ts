/**
 * Membership Detail View Repository
 * GET /api/v3/memberships/:id/view/detail
 * GET /api/v3/memberships/views/detail
 *
 * Returns membership(s) with joined user, organization, company, and role data.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = '*, users(*), organizations(*), companies(*), roles!memberships_role_name_fkey(*)';

export class MembershipDetailViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('memberships')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findAll(
    params: {
      page?: number;
      limit?: number;
      user_id?: string;
      role_name?: string;
      organization_id?: string;
      company_id?: string;
      sort_by?: string;
      sort_order?: string;
    },
    scopeFilters?: { user_id?: string; organization_ids?: string[] }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('memberships')
      .select(DETAIL_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (scopeFilters?.user_id) {
      query = query.eq('user_id', scopeFilters.user_id);
    }
    if (scopeFilters?.organization_ids && scopeFilters.organization_ids.length > 0) {
      query = query.in('organization_id', scopeFilters.organization_ids);
    }

    if (params.user_id) query = query.eq('user_id', params.user_id);
    if (params.role_name) query = query.eq('role_name', params.role_name);
    if (params.organization_id) query = query.eq('organization_id', params.organization_id);
    if (params.company_id !== undefined) {
      if (params.company_id === null) {
        query = query.is('company_id', null);
      } else {
        query = query.eq('company_id', params.company_id);
      }
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
