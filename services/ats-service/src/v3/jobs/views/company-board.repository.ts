/**
 * Company Board View Repository
 * Joins companies, batch-fetches application counts
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobListParams } from '../types';

const SORTABLE_FIELDS = ['created_at', 'title', 'status', 'updated_at', 'salary_min'];

export class CompanyBoardRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForBoard(
    params: JobListParams,
    companyIds: string[],
    identityUserId?: string
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('jobs')
      .select(`
        id, title, status, location, department, employment_type,
        salary_min, salary_max, fee_percentage, guarantee_days,
        job_owner_id, activates_at, closes_at, created_at,
        company:companies(id, name, logo_url)
      `, { count: 'exact' })
      .in('company_id', companyIds);

    if (params.job_owner_filter === 'assigned' && identityUserId) {
      query = query.eq('job_owner_id', identityUserId);
    }

    if (params.status) query = query.eq('status', params.status);
    if (params.employment_type) query = query.eq('employment_type', params.employment_type);
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

  async batchFetchApplicationCounts(jobIds: string[]): Promise<{ total: Record<string, number>; active: Record<string, number> }> {
    if (jobIds.length === 0) return { total: {}, active: {} };

    const { data: allApps } = await this.supabase
      .from('applications')
      .select('job_id, stage')
      .in('job_id', jobIds)
      .is('expired_at', null);

    const total: Record<string, number> = {};
    const active: Record<string, number> = {};
    const terminalStages = ['rejected', 'withdrawn', 'hired'];

    for (const a of allApps || []) {
      total[a.job_id] = (total[a.job_id] || 0) + 1;
      if (!terminalStages.includes(a.stage)) {
        active[a.job_id] = (active[a.job_id] || 0) + 1;
      }
    }
    return { total, active };
  }

  async getCompanyIdsForOrg(organizationIds: string[]): Promise<string[]> {
    const { data } = await this.supabase
      .from('companies')
      .select('id')
      .in('identity_organization_id', organizationIds);
    return data?.map((c: any) => c.id) || [];
  }
}
