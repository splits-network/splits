/**
 * Recruiter Activity V3 Repository — Pure Data Layer
 *
 * NO role logic. Internal-only resource (no routes).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterActivity, CreateActivityInput } from './types';

export class RecruiterActivityRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByRecruiterId(recruiterId: string, limit = 5): Promise<RecruiterActivity[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));

    const { data, error } = await this.supabase
      .from('recruiter_activity')
      .select('id, recruiter_id, activity_type, description, metadata, created_at')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) throw error;
    return (data || []) as RecruiterActivity[];
  }

  async create(input: CreateActivityInput): Promise<RecruiterActivity> {
    const { data, error } = await this.supabase
      .from('recruiter_activity')
      .insert({
        recruiter_id: input.recruiter_id,
        activity_type: input.activity_type,
        description: input.description,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as RecruiterActivity;
  }
}
