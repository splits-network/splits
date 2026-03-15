/**
 * Recruiter-Companies List View Repository
 * GET /api/v3/recruiter-companies/views/list
 *
 * Returns paginated relationships with recruiter (user) and company joins.
 * Used by the /portal/company-invitations page which needs counterparty names.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompanyListParams } from '../types';

const LIST_SELECT = `
  *,
  recruiter:recruiters(
    id, user_id,
    user:users!recruiters_user_id_fkey(id, name, email)
  ),
  company:companies(
    id, name, industry, headquarters_location, logo_url
  )
`;

interface ScopeFilters {
  recruiter_id?: string;
  company_ids?: string[];
}

export class RecruiterCompanyListRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RecruiterCompanyListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_companies').select(LIST_SELECT, { count: 'exact' });

    // Scope filters (from access context)
    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (scopeFilters?.company_ids?.length) query = query.in('company_id', scopeFilters.company_ids);

    // User-provided filters
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.company_id) query = query.eq('company_id', params.company_id);
    if (params.relationship_type) query = query.eq('relationship_type', params.relationship_type);
    if (params.status) query = query.eq('status', params.status);

    const SORTABLE_FIELDS = ['created_at', 'updated_at', 'status', 'relationship_type'];
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }
}
