/**
 * Editor View Repository
 * All editable fields + requirements + skills + pre-screen questions
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class EditorRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select(`
        id, title, department, location,
        salary_min, salary_max, fee_percentage, guarantee_days,
        description, recruiter_description, candidate_description,
        employment_type, open_to_relocation, show_salary_range,
        commute_types, job_level, status,
        pre_screen_questions,
        activates_at, closes_at,
        company_id, source_firm_id,
        job_owner_id, job_owner_recruiter_id, company_recruiter_id,
        created_at, updated_at
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findRequirements(jobId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('job_requirements')
      .select('id, requirement_type, description, sort_order')
      .eq('job_id', jobId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findSkills(jobId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('job_skills')
      .select('job_id, skill_id, is_required, skill:skills(id, name, slug)')
      .eq('job_id', jobId);

    if (error) throw error;
    return data || [];
  }
}
