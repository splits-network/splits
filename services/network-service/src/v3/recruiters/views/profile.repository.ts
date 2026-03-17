/**
 * Recruiter Profile View Repository
 *
 * Enriched single-recruiter fetch for public profile pages.
 * Joins: user, reputation, firm, recent activity, response metrics.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const PROFILE_SELECT = `
  *,
  users!user_id(id, name, email, created_at, profile_image_url),
  recruiter_reputation!recruiter_id(
    recruiter_id, total_submissions, total_hires, hire_rate,
    total_placements, completed_placements, failed_placements,
    completion_rate, total_collaborations, collaboration_rate,
    avg_response_time_hours, reputation_score,
    last_calculated_at, created_at, updated_at
  ),
  firm_members!recruiter_id(firm_id, role, firms!firm_id(id, name, slug)),
  recruiter_activity_recent!recruiter_id(id, activity_type, description, metadata, created_at)
`;

export class RecruiterProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiters')
      .select(PROFILE_SELECT)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiters')
      .select(PROFILE_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async getResponseMetrics(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_response_metrics_latest')
      .select('response_rate, avg_response_time_hours')
      .eq('recruiter_id', recruiterId)
      .maybeSingle();
    if (error) return null;
    return data;
  }
}
