/**
 * Candidate Listing View Repository
 * Safe columns only, joins companies + batch skills
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobListParams } from '../types';

const SORTABLE_FIELDS = ['created_at', 'title', 'updated_at'];

export class CandidateListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForListing(params: JobListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('jobs')
      .select(`
        id, title, candidate_description, location, department,
        employment_type, commute_types, job_level,
        open_to_relocation, show_salary_range,
        salary_min, salary_max, status, created_at, updated_at,
        company:companies(id, name, logo_url, industry, headquarters_location)
      `, { count: 'exact' })
      .eq('status', 'active')
      .eq('is_early_access', false);

    if (params.employment_type) query = query.eq('employment_type', params.employment_type);
    if (params.job_level) query = query.eq('job_level', params.job_level);
    if (params.commute_type) {
      const types = Array.isArray(params.commute_type) ? params.commute_type : [params.commute_type];
      query = query.overlaps('commute_types', types);
    }
    if (params.location && !params.search) {
      query = query.ilike('location', `%${params.location}%`);
    }

    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(Boolean).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  /** Resolve clerk_user_id → candidate_id via users table */
  async resolveCandidateId(clerkUserId: string): Promise<string | null> {
    const { data: user } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    if (!user) return null;

    const { data: candidate } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    return candidate?.id || null;
  }

  /** Batch fetch match scores for a candidate across multiple jobs */
  async batchFetchMatchScores(candidateId: string, jobIds: string[]): Promise<Record<string, number>> {
    if (jobIds.length === 0) return {};
    const { data } = await this.supabase
      .from('candidate_role_matches')
      .select('job_id, match_score')
      .eq('candidate_id', candidateId)
      .eq('status', 'active')
      .in('job_id', jobIds);

    const map: Record<string, number> = {};
    for (const row of data || []) {
      map[row.job_id] = Number(row.match_score);
    }
    return map;
  }

  async batchFetchSkills(jobIds: string[]): Promise<Record<string, any[]>> {
    if (jobIds.length === 0) return {};
    const { data } = await this.supabase
      .from('job_skills')
      .select('job_id, is_required, skill:skills(name)')
      .in('job_id', jobIds);

    const map: Record<string, any[]> = {};
    for (const s of data || []) {
      if (!map[s.job_id]) map[s.job_id] = [];
      map[s.job_id].push(s);
    }
    return map;
  }
}
