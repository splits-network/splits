/**
 * Detail View Repository — Job Recommendations
 * Joins: job (with company), candidate
 */

import { SupabaseClient } from '@supabase/supabase-js';

const SELECT_WITH_RELATIONS = `
  *,
  job:jobs(id, title, company_id, location, employment_type),
  candidate:candidates(id, full_name, email)
`;

export class JobRecommendationDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('job_recommendations')
      .select(SELECT_WITH_RELATIONS)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }
}
