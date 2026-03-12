/**
 * Recruiter Board View Repository
 * Joins: companies, batch-fetches skills and application counts
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobListParams } from '../types';

const SORTABLE_FIELDS = ['created_at', 'title', 'status', 'updated_at', 'salary_min', 'fee_percentage'];

export class RecruiterBoardRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForBoard(
    params: JobListParams,
    recruiterId: string,
    excludeEarlyAccess: boolean,
    involvedJobIds?: string[],
    savedJobIds?: string[]
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('jobs')
      .select(`
        id, title, status, is_early_access, is_priority,
        fee_percentage, guarantee_days,
        location, department, employment_type, commute_types, job_level,
        salary_min, salary_max, source_firm_id, company_id,
        activates_at, closes_at, created_at, updated_at,
        job_owner_recruiter_id, company_recruiter_id,
        company:companies(id, name, logo_url, industry, headquarters_location)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Exclude early access jobs for non-partner tier
    if (excludeEarlyAccess) {
      query = query.eq('is_early_access', false);
    }

    // Assigned filter
    if (params.job_owner_filter === 'assigned' && involvedJobIds) {
      const orConditions = [
        `job_owner_recruiter_id.eq.${recruiterId}`,
        `company_recruiter_id.eq.${recruiterId}`,
      ];
      if (involvedJobIds.length > 0) {
        orConditions.push(`id.in.(${involvedJobIds.join(',')})`);
      }
      query = query.or(orConditions.join(','));
    }

    // Saved filter
    if (params.job_owner_filter === 'saved' && savedJobIds) {
      query = query.in('id', savedJobIds);
    }

    // Filters
    if (params.status) query = query.eq('status', params.status);
    if (params.employment_type) query = query.eq('employment_type', params.employment_type);
    if (params.company_id) query = query.eq('company_id', params.company_id);
    if (params.job_level) query = query.eq('job_level', params.job_level);
    if (params.commute_type) {
      const types = Array.isArray(params.commute_type) ? params.commute_type : [params.commute_type];
      query = query.overlaps('commute_types', types);
    }
    if (params.location && !params.search) {
      query = query.ilike('location', `%${params.location}%`);
    }

    // Search
    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(Boolean).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }

    // Sort
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });

    // Paginate
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

  async getInvolvedJobIds(recruiterId: string): Promise<string[]> {
    const { data: apps } = await this.supabase
      .from('applications')
      .select('job_id')
      .eq('candidate_recruiter_id', recruiterId)
      .in('stage', ['recruiter_proposed', 'draft', 'recruiter_request', 'ai_review', 'screen', 'submitted', 'interview', 'offer']);

    const { data: placements } = await this.supabase
      .from('placements')
      .select('job_id')
      .eq('candidate_recruiter_id', recruiterId);

    const appIds = apps?.map(a => a.job_id) || [];
    const placementIds = placements?.map(p => p.job_id) || [];
    return [...new Set([...appIds, ...placementIds])];
  }

  async getRecruiterTier(recruiterId: string): Promise<string> {
    const { data: sub } = await this.supabase
      .from('subscriptions')
      .select('plan:plans(tier)')
      .eq('recruiter_id', recruiterId)
      .eq('status', 'active')
      .maybeSingle();

    return (sub?.plan as any)?.tier ?? 'starter';
  }
}
