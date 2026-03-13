/**
 * Leaderboards V3 Repository — Read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardListParams } from './types';

const SORTABLE_FIELDS = ['rank', 'score'];

export class LeaderboardRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: LeaderboardListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('leaderboard_entries').select('*', { count: 'exact' })
      .eq('entity_type', params.entity_type)
      .eq('period', params.period)
      .eq('metric', params.metric);

    if (params.period_start) query = query.eq('period_start', params.period_start);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'rank';
    query = query.order(sortBy, { ascending: params.sort_order !== 'desc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('leaderboard_entries').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findEntityRank(entityType: string, entityId: string, period: string, metric: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('period', period)
      .eq('metric', metric)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
