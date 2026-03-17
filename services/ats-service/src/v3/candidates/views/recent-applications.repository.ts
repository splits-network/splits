/**
 * Candidate Recent Applications View Repository
 *
 * Returns a candidate's most recent applications with joined
 * job title, company name, and location.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateRecentApplicationsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getRecentApplications(candidateId: string, limit = 5) {
    const safeLimit = Math.max(1, Math.min(limit, 25));

    const { data, error } = await this.supabase
      .from('applications')
      .select(`id, job_id, stage, status, created_at, updated_at,
        job:jobs(id, title, location, company:companies(id, name))`)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .range(0, safeLimit - 1);

    if (error) throw error;

    return (data || []).map((app: any) => ({
      id: app.id,
      job_id: app.job_id,
      job_title: app.job?.title || 'Unknown Position',
      company: app.job?.company?.name || 'Unknown Company',
      location: app.job?.location || null,
      status: app.status,
      stage: app.stage,
      applied_at: app.created_at,
      updated_at: app.updated_at,
    }));
  }
}
