/**
 * Public Companies Repository
 *
 * Read-only queries for the public company directory.
 * Only returns marketplace-visible, active companies.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_COMPANY_SELECT, PublicCompanyListParams, PublicCompanyJobsParams } from './types.js';

const VISIBILITY_FILTERS = { marketplace_visible: true, status: 'active' } as const;

export class PublicCompanyRepository {
  constructor(private supabase: SupabaseClient) {}

  async findPublicCompanies(params: PublicCompanyListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 24, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('companies')
      .select(PUBLIC_COMPANY_SELECT, { count: 'exact' })
      .eq('marketplace_visible', true)
      .eq('status', 'active');

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,tagline.ilike.%${params.search}%,industry.ilike.%${params.search}%`);
    }
    if (params.industry) query = query.ilike('industry', `%${params.industry}%`);
    if (params.company_size) query = query.eq('company_size', params.company_size);
    if (params.stage) query = query.eq('stage', params.stage);

    query = query.order(params.sort_by || 'name', { ascending: params.sort_order !== 'desc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const companies = (data || []) as any[];

    // Enrich with open job counts in a single batch query
    if (companies.length > 0) {
      const companyIds = companies.map(c => c.id);
      const { data: jobCounts } = await this.supabase
        .from('jobs')
        .select('company_id')
        .in('company_id', companyIds)
        .eq('status', 'active');

      const countMap = new Map<string, number>();
      for (const j of jobCounts || []) {
        countMap.set(j.company_id, (countMap.get(j.company_id) || 0) + 1);
      }
      for (const company of companies) {
        company.open_roles_count = countMap.get(company.id) || 0;
      }
    }

    return { data: companies, total: count || 0 };
  }

  async findPublicCompanyBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select(PUBLIC_COMPANY_SELECT)
      .eq('slug', slug)
      .eq('marketplace_visible', true)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Enrich with open job count
    const company = data as any;
    const { count } = await this.supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('status', 'active');
    company.open_roles_count = count || 0;

    return company;
  }

  async findPublicCompanyPerks(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_perks')
      .select('perk:perks!inner(id, name, category)')
      .eq('company_id', companyId);
    if (error) throw error;
    return (data || []).map((d: any) => d.perk);
  }

  async findPublicCompanyCultureTags(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_culture_tags')
      .select('culture_tag:culture_tags!inner(id, name, category)')
      .eq('company_id', companyId);
    if (error) throw error;
    return (data || []).map((d: any) => d.culture_tag);
  }

  async findPublicCompanySkills(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('company_skills')
      .select('skill:skills!inner(id, name)')
      .eq('company_id', companyId);
    if (error) throw error;
    return (data || []).map((d: any) => d.skill);
  }

  async findPublicCompanyReputation(companyId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('company_reputation')
      .select('reputation_score, reputation_tier, total_hires, total_placements, hire_rate, completion_rate')
      .eq('company_id', companyId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findPublicCompanyJobs(companyId: string, params: PublicCompanyJobsParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from('jobs')
      .select(`
        id, title, candidate_description, description, location,
        employment_type, commute_types, job_level,
        salary_min, salary_max, show_salary_range,
        status, created_at, source_firm_id,
        company:companies(id, name, logo_url, headquarters_location, industry, description),
        firm:firms(id, name, logo_url)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const jobs = data || [];
    const jobIds = jobs.map((j: any) => j.id);

    // Batch fetch skills (same pattern as ats-service candidate-listing)
    const skillsMap = await this.batchFetchJobSkills(jobIds);

    // Shape response: enforce salary visibility, attach skills
    const shaped = jobs.map((job: any) => {
      const result: any = {
        ...job,
        skills: skillsMap[job.id] || [],
      };
      if (!job.show_salary_range) {
        delete result.salary_min;
        delete result.salary_max;
      }
      delete result.show_salary_range;
      return result;
    });

    return { data: shaped, total: count || 0 };
  }

  private async batchFetchJobSkills(jobIds: string[]): Promise<Record<string, any[]>> {
    if (jobIds.length === 0) return {};
    const { data } = await this.supabase
      .from('job_skills')
      .select('job_id, is_required, skill:skills(id, name)')
      .in('job_id', jobIds);

    const map: Record<string, any[]> = {};
    for (const s of data || []) {
      if (!map[s.job_id]) map[s.job_id] = [];
      map[s.job_id].push(s);
    }
    return map;
  }
}
