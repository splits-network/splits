/**
 * Enriched Matches View Repository
 * Joins: candidates, jobs + companies
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MatchListParams } from '../types';

const ENRICHED_SELECT = `
  *,
  candidates(id, full_name),
  jobs(id, title, location, salary_min, salary_max, employment_type, job_level, companies(id, name, logo_url))
`;

const SORTABLE_FIELDS = ['created_at', 'match_score'];

export class EnrichedMatchRepository {
  constructor(private supabase: SupabaseClient) {}

  async findEnriched(
    params: MatchListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidate_role_matches')
      .select(ENRICHED_SELECT, { count: 'exact' });

    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.match_tier) query = query.eq('match_tier', params.match_tier);
    if (params.status) query = query.eq('status', params.status);
    if (params.min_score !== undefined) query = query.gte('match_score', params.min_score);
    if (params.invite_status) query = query.eq('invite_status', params.invite_status);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'match_score';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Map joined relations to expected shape
    const mapped = (data || []).map((row: any) => ({
      ...row,
      candidate: row.candidates ?? null,
      job: row.jobs ? {
        ...row.jobs,
        company: row.jobs.companies ?? null,
      } : null,
      candidates: undefined,
      jobs: undefined,
    }));

    return { data: mapped, total: count || 0 };
  }
}
