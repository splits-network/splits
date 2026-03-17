/**
 * Job Stats View Repository
 * Fetches AI review data with joins for stats aggregation.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class JobStatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async findReviewsByJobId(jobId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .select('fit_score, recommendation, matched_skills, missing_skills')
      .eq('job_id', jobId);

    if (error) throw error;
    return data || [];
  }
}
