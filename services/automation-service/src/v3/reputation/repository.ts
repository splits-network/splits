/**
 * Reputation V3 Repository — Read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ReputationListParams } from './types.js';

const SORTABLE_FIELDS = ['reputation_score', 'updated_at'];

export class ReputationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ReputationListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_reputation').select('*', { count: 'exact' });
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'reputation_score';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findByRecruiterId(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_reputation').select('*').eq('recruiter_id', recruiterId).maybeSingle();
    if (error) throw error;
    return data;
  }
}
