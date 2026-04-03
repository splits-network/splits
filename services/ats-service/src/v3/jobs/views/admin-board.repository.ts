/**
 * Admin Board View Repository
 * All jobs, no row scoping, joins companies
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobListParams } from '../types.js';

const SORTABLE_FIELDS = ['created_at', 'title', 'status', 'updated_at'];

export class AdminBoardRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForBoard(params: JobListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('jobs')
      .select(`
        *,
        company:companies(id, name, logo_url, industry, headquarters_location)
      `, { count: 'exact' });

    // No deleted_at filter for admin — they see everything
    if (params.status) query = query.eq('status', params.status);
    if (params.company_id) query = query.eq('company_id', params.company_id);
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

  async batchFetchSkills(jobIds: string[]): Promise<Record<string, any[]>> {
    if (jobIds.length === 0) return {};
    const { data } = await this.supabase
      .from('job_skills')
      .select('job_id, skill_id, is_required, skill:skills(id, name, slug)')
      .in('job_id', jobIds);

    const map: Record<string, any[]> = {};
    for (const s of data || []) {
      if (!map[s.job_id]) map[s.job_id] = [];
      map[s.job_id].push(s);
    }
    return map;
  }

  async batchFetchApplicationCounts(jobIds: string[]): Promise<Record<string, number>> {
    if (jobIds.length === 0) return {};
    const { data } = await this.supabase
      .from('applications')
      .select('job_id')
      .in('job_id', jobIds)
      .is('expired_at', null)
      .not('stage', 'in', '(rejected,withdrawn,hired)');

    const counts: Record<string, number> = {};
    for (const a of data || []) {
      counts[a.job_id] = (counts[a.job_id] || 0) + 1;
    }
    return counts;
  }
}
