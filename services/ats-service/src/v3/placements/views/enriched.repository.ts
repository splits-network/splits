/**
 * Enriched Placements View Repository
 * Joins: candidates, jobs + companies, splits + recruiters
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementListParams } from '../types.js';
import { PlacementScopeFilters } from './scoped-list.repository.js';

const ENRICHED_SELECT = `
  *,
  candidate:candidates(id, full_name, email),
  job:jobs(id, title, company:companies(id, name, logo_url, identity_organization_id)),
  splits:placement_splits(id, role, split_percentage, split_amount, recruiter_id, recruiter:recruiters(id, user:users!recruiters_user_id_fkey(name)))
`;

const SORTABLE_FIELDS = ['created_at', 'hired_at', 'state', 'salary', 'fee_percentage'];

export class EnrichedPlacementRepository {
  constructor(private supabase: SupabaseClient) {}

  async findEnriched(
    params: PlacementListParams,
    scopeFilters?: PlacementScopeFilters,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('placements')
      .select(ENRICHED_SELECT, { count: 'exact' });

    // Role-based scoping
    if (scopeFilters?.candidate_id) {
      query = query.eq('candidate_id', scopeFilters.candidate_id);
    }
    if (scopeFilters?.recruiter_id) {
      query = query.or(
        `candidate_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `company_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `job_owner_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `candidate_sourcer_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `company_sourcer_recruiter_id.eq.${scopeFilters.recruiter_id}`
      );
    }
    if (scopeFilters?.organization_ids && scopeFilters.organization_ids.length > 0) {
      const { data: orgJobs } = await this.supabase
        .from('jobs')
        .select('id, company:companies!inner(identity_organization_id)')
        .in('company.identity_organization_id', scopeFilters.organization_ids);
      const jobIds = (orgJobs || []).map((j: any) => j.id);
      if (jobIds.length === 0) return { data: [], total: 0 };
      query = query.in('job_id', jobIds);
    }

    // Filters
    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(Boolean).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }
    if (params.status) query = query.eq('state', params.status);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);

    // Sorting
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Map joined relations to expected shape
    const mapped = (data || []).map((row: any) => ({
      ...row,
      candidate: row.candidate ?? null,
      job: row.job ? {
        ...row.job,
        company: row.job.company ?? null,
      } : null,
      splits: (row.splits || []).map((s: any) => ({
        ...s,
        recruiter: s.recruiter ? {
          ...s.recruiter,
          user: s.recruiter.user ?? null,
        } : null,
      })),
    }));

    return { data: mapped, total: count || 0 };
  }
}
