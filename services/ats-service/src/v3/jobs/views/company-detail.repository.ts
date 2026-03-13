/**
 * Company Detail View Repository
 * Joins: company, requirements, skills, recruiter name, app stage breakdown
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CompanyDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select(`
        id, title, status, location, department, employment_type,
        salary_min, salary_max, fee_percentage, guarantee_days,
        description, candidate_description,
        commute_types, job_level, open_to_relocation, show_salary_range,
        job_owner_recruiter_id, pre_screen_questions,
        activates_at, closes_at, created_at, updated_at,
        company:companies(id, name, logo_url, industry, headquarters_location, description, website)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findRequirements(jobId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('job_requirements')
      .select('id, requirement_type, description, sort_order')
      .eq('job_id', jobId)
      .order('requirement_type')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findSkills(jobId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('job_skills')
      .select('skill_id, is_required, skill:skills(name)')
      .eq('job_id', jobId);

    if (error) throw error;
    return data || [];
  }

  async getRecruiterName(recruiterId: string): Promise<string | null> {
    if (!recruiterId) return null;
    const { data } = await this.supabase
      .from('recruiters')
      .select('first_name, last_name')
      .eq('id', recruiterId)
      .maybeSingle();
    return data ? `${data.first_name} ${data.last_name}` : null;
  }

  async getCompanyOrgId(companyId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('companies')
      .select('identity_organization_id')
      .eq('id', companyId)
      .maybeSingle();
    return data?.identity_organization_id || null;
  }

  async getApplicationStageBreakdown(jobId: string): Promise<{ stage: string; count: number }[]> {
    const { data } = await this.supabase
      .from('applications')
      .select('stage')
      .eq('job_id', jobId)
      .is('expired_at', null);

    const counts: Record<string, number> = {};
    for (const a of data || []) {
      counts[a.stage] = (counts[a.stage] || 0) + 1;
    }
    return Object.entries(counts).map(([stage, count]) => ({ stage, count }));
  }
}
