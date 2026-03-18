/**
 * Admin Lists View Repository
 * Applications, candidates, assignments, placements for admin dashboard
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from '../types';

function paginate(params: AdminListParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 25));
  return { page, limit, offset: (page - 1) * limit };
}

function buildPagination(total: number, page: number, limit: number) {
  return { total, page, limit, total_pages: Math.ceil(total / limit) };
}

export class AdminListsRepository {
  constructor(private supabase: SupabaseClient) {}

  async listApplications(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('applications')
      .select('*, job:jobs(id, title), candidate:candidates(id, full_name, email)', { count: 'exact' });

    if (params.stage) query = query.eq('stage', params.stage);
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async listCandidates(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('candidates')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async listAssignments(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'assigned_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('role_assignments')
      .select('*, job:jobs(id, title)', { count: 'exact' });

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async listPlacements(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('placements')
      .select('*', { count: 'exact' });

    if (params.state) query = query.eq('state', params.state);
    if (params.search) {
      query = query.or(`candidate_name.ilike.%${params.search}%,company_name.ilike.%${params.search}%`);
    }
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }
}
