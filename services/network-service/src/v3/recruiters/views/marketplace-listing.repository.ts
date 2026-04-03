/**
 * Marketplace Listing View Repository
 *
 * Joins: user (name, avatar), reputation (scores), firm membership
 * Sorts by reputation columns. Public data — no access scoping.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterListParams } from '../types.js';

const REPUTATION_SORT_COLUMNS = new Set([
  'reputation_score', 'total_submissions', 'total_hires',
  'hire_rate', 'completion_rate', 'quality_score',
  'avg_time_to_hire_days', 'avg_response_time_hours',
]);

export class MarketplaceListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForListing(params: RecruiterListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('recruiters')
      .select(`
        *,
        users!user_id(id, name, email, created_at, profile_image_url),
        recruiter_reputation!recruiter_id(
          recruiter_id, total_submissions, total_hires, hire_rate,
          total_placements, completed_placements, failed_placements,
          completion_rate, total_collaborations, collaboration_rate,
          avg_response_time_hours, reputation_score,
          last_calculated_at, created_at, updated_at
        ),
        firm_members!recruiter_id(firm_id, role, firms!firm_id(id, name, slug))
      `, { count: 'exact' });

    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(t => t).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }
    if (params.status) query = query.eq('status', params.status);
    if (params.specialization && !params.search) {
      query = query.ilike('specialization', `%${params.specialization}%`);
    }
    if (params.is_candidate_recruiter === 'yes') query = query.eq('candidate_recruiter', true);
    else if (params.is_candidate_recruiter === 'no') query = query.eq('candidate_recruiter', false);
    if (params.is_company_recruiter === 'yes') query = query.eq('company_recruiter', true);
    else if (params.is_company_recruiter === 'no') query = query.eq('company_recruiter', false);
    // Marketplace listing always requires marketplace_enabled — this is a hard filter,
    // not client-controlled. Non-marketplace recruiters must never appear here.
    query = query.eq('marketplace_enabled', true);
    if (params.filters?.company_ids?.length) {
      const { data: rels } = await this.supabase
        .from('recruiter_companies').select('recruiter_id')
        .in('company_id', params.filters.company_ids).eq('status', 'active');
      const ids = rels?.map(r => r.recruiter_id) || [];
      if (ids.length === 0) return { data: [], total: 0 };
      query = query.in('id', ids);
    }

    const sortBy = params.sort_by || 'reputation_score';
    const ascending = params.sort_order === 'asc';

    if (REPUTATION_SORT_COLUMNS.has(sortBy)) {
      query = query.order(sortBy, { ascending, referencedTable: 'recruiter_reputation' });
    } else {
      query = query.order(sortBy, { ascending });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async batchGetPlanTiers(recruiterIds: string[]): Promise<Map<string, string>> {
    const tierMap = new Map<string, string>();
    if (recruiterIds.length === 0) return tierMap;
    const { data } = await this.supabase
      .from('subscriptions').select('recruiter_id, plan:plans(tier)')
      .in('recruiter_id', recruiterIds).eq('status', 'active');
    for (const row of data || []) {
      tierMap.set(row.recruiter_id, (row.plan as any)?.tier ?? 'starter');
    }
    return tierMap;
  }
}
