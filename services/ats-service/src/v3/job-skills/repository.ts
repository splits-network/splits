/**
 * Job Skills V3 Repository
 * Junction table — joins skills for name/slug (exception for junction tables)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobSkillListParams } from './types.js';

export class JobSkillRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: JobSkillListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    const offset = (page - 1) * limit;

    const { data, count, error } = await this.supabase
      .from('job_skills')
      .select('*', { count: 'exact' })
      .eq('job_id', params.job_id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async add(jobId: string, skillId: string, isRequired: boolean): Promise<any> {
    const { data, error } = await this.supabase
      .from('job_skills')
      .upsert({ job_id: jobId, skill_id: skillId, is_required: isRequired })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async remove(jobId: string, skillId: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_skills')
      .delete()
      .eq('job_id', jobId)
      .eq('skill_id', skillId);

    if (error) throw error;
  }
}
