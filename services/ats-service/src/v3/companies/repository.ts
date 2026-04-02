/**
 * Companies V3 Repository — Core CRUD + enrichment
 *
 * Pure data layer. NO role logic.
 * Role scoping and authorization happen in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'updated_at', 'name', 'industry', 'company_size', 'stage'] as const;

export class CompanyRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CompanyListParams,
    scopeFilters?: { organization_ids?: string[] }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('companies')
      .select('*', { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.organization_ids && scopeFilters.organization_ids.length > 0) {
      query = query.in('identity_organization_id', scopeFilters.organization_ids);
    }
    // User-supplied filters
    if (params.identity_organization_id) {
      query = query.eq('identity_organization_id', params.identity_organization_id);
    }
    if (params.search) {
      const tsquery = params.search
        .replace(/[@+._\-\/:]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .join(' & ');
      query = query.textSearch('search_vector', tsquery, {
        type: 'websearch',
        config: 'english',
      });
    }
    if (params.industry) query = query.eq('industry', params.industry);
    if (params.company_size) query = query.eq('company_size', params.company_size);
    if (params.stage) query = query.eq('stage', params.stage);

    // has_open_roles sub-filter
    if (params.has_open_roles) {
      const { data: activeJobCompanies } = await this.supabase
        .from('jobs')
        .select('company_id')
        .eq('status', 'active');

      const companyIdsWithJobs = [
        ...new Set((activeJobCompanies || []).map((j: any) => j.company_id)),
      ];

      if (params.has_open_roles === 'yes') {
        if (companyIdsWithJobs.length === 0) return { data: [], total: 0 };
        query = query.in('id', companyIdsWithJobs);
      } else if (params.has_open_roles === 'no' && companyIdsWithJobs.length > 0) {
        query = query.not('id', 'in', `(${companyIdsWithJobs.join(',')})`);
      }
    }

    // Sorting
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by as any) ? params.sort_by! : 'name';
    const ascending = params.sort_order?.toLowerCase() !== 'desc';
    query = query.order(sortBy, { ascending });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Enrich with open_roles_count
    const companyIds = (data || []).map((c: any) => c.id);
    if (companyIds.length === 0) return { data: [], total: 0 };

    const enriched = await this.enrichWithJobStats(data || [], companyIds);
    return { data: enriched, total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const enriched = await this.enrichWithJobStats([data], [id]);
    return enriched[0];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private async enrichWithJobStats(companies: any[], companyIds: string[]): Promise<any[]> {
    const { data: jobRows } = await this.supabase
      .from('jobs')
      .select('company_id, status, salary_min, salary_max')
      .in('company_id', companyIds);

    const statsMap: Record<string, { open_roles_count: number; salary_sum: number; salary_count: number }> = {};
    for (const job of jobRows || []) {
      if (!statsMap[job.company_id]) {
        statsMap[job.company_id] = { open_roles_count: 0, salary_sum: 0, salary_count: 0 };
      }
      if (job.status === 'active') {
        statsMap[job.company_id].open_roles_count += 1;
        if (job.salary_min != null && job.salary_max != null) {
          statsMap[job.company_id].salary_sum += (job.salary_min + job.salary_max) / 2;
          statsMap[job.company_id].salary_count += 1;
        }
      }
    }

    return companies.map((c: any) => ({
      ...c,
      open_roles_count: statsMap[c.id]?.open_roles_count ?? 0,
      avg_salary: statsMap[c.id]?.salary_count > 0
        ? Math.round(statsMap[c.id].salary_sum / statsMap[c.id].salary_count)
        : null,
    }));
  }
}
