/**
 * Recruiter Detail View Repository
 * Full joins: company, requirements, skills, firm
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class RecruiterDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select(`
        *,
        company:companies(id, name, logo_url, industry, headquarters_location, description, website),
        firm:firms(id, name)
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
      .select('skill_id, is_required, skill:skills(id, name, slug)')
      .eq('job_id', jobId);

    if (error) throw error;
    return data || [];
  }
}
