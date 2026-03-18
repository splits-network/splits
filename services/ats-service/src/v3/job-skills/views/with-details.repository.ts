/**
 * Job Skills "with-details" View Repository
 *
 * Joins job_skills with skills to include skill name/slug.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobSkillListParams } from '../types';

const WITH_DETAILS_SELECT = '*, skill:skills(id, name, slug)';

export class WithDetailsJobSkillRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: JobSkillListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    const offset = (page - 1) * limit;

    const { data, count, error } = await this.supabase
      .from('job_skills')
      .select(WITH_DETAILS_SELECT, { count: 'exact' })
      .eq('job_id', params.job_id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
