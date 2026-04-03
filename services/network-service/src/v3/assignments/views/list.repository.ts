/**
 * Assignments List View Repository
 * GET /api/v3/assignments/views/list
 *
 * Returns assignments with recruiter and job+company joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AssignmentListParams } from '../types.js';

interface ScopeFilters {
  recruiter_id?: string;
  organization_ids?: string[];
}

const LIST_SELECT = `
  *,
  recruiter:recruiters(id, name, email),
  job:jobs(id, title, company:companies!inner(id, name, identity_organization_id))
`;

export class AssignmentListViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: AssignmentListParams,
    scopeFilters?: ScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('role_assignments')
      .select(LIST_SELECT, { count: 'exact' });

    if (scopeFilters?.recruiter_id) {
      query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    }
    if (scopeFilters?.organization_ids?.length) {
      query = query.in('job.company.identity_organization_id', scopeFilters.organization_ids);
    }

    if (params.status) query = query.eq('status', params.status);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.job_id) query = query.eq('job_id', params.job_id);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
