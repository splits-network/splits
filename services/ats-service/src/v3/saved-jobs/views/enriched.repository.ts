/**
 * Enriched Saved Jobs View Repository
 * Joins jobs + companies
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SavedJobListParams } from '../types.js';

export class EnrichedSavedJobRepository {
  constructor(private supabase: SupabaseClient) {}

  async findEnriched(
    candidateId: string,
    params: SavedJobListParams
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidate_saved_jobs')
      .select(`
        *,
        job:jobs(
          id, title, location, department, employment_type,
          commute_types, job_level, salary_min, salary_max,
          show_salary_range, status, created_at,
          company:companies(id, name, logo_url, industry, headquarters_location)
        )
      `, { count: 'exact' })
      .eq('candidate_id', candidateId);

    if (params.job_id) query = query.eq('job_id', params.job_id);

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
