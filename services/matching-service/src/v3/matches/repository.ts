/**
 * Matches V3 Repository — Core CRUD
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MatchListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'match_score'];

export class MatchRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: MatchListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidate_role_matches')
      .select('*', { count: 'exact' });

    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.match_tier) query = query.eq('match_tier', params.match_tier);
    if (params.status) query = query.eq('status', params.status);
    if (params.min_score !== undefined) query = query.gte('match_score', params.min_score);
    if (params.invite_status) query = query.eq('invite_status', params.invite_status);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'match_score';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidate_role_matches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('candidate_role_matches')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
