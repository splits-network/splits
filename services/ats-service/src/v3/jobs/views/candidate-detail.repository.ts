/**
 * Candidate Detail View Repository
 * Safe columns only + company, requirements, skills
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select(`
        id, title, candidate_description, location, department,
        employment_type, commute_types, job_level,
        open_to_relocation, show_salary_range,
        salary_min, salary_max, status, created_at, updated_at,
        company:companies(id, name, logo_url, industry, headquarters_location, description, website)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .in('status', ['active', 'priority'])
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
}
