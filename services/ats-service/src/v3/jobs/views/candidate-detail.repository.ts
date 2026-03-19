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
        salary_min, salary_max, pre_screen_questions, status, created_at, updated_at,
        company:companies(id, name, logo_url, industry, headquarters_location, description, website),
        firm:firms(id, name, logo_url)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .eq('is_early_access', false)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /** Resolve clerk_user_id → candidate_id via users table */
  async resolveCandidateId(clerkUserId: string): Promise<string | null> {
    const { data: user } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    if (!user) return null;

    const { data: candidate } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    return candidate?.id || null;
  }

  /** Fetch match score for a specific candidate + job */
  async findMatchScore(candidateId: string, jobId: string): Promise<number | null> {
    const { data } = await this.supabase
      .from('candidate_role_matches')
      .select('match_score')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .eq('status', 'active')
      .maybeSingle();
    return data ? Number(data.match_score) : null;
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
