/**
 * Leaderboards V3 Repository — Core CRUD (read-only)
 *
 * DEPRECATED: Leaderboards are now served as views.
 * See views/public-listing.repository.ts for the active implementation.
 * This file is kept for any internal service references.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardListParams } from './types.js';

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
}
