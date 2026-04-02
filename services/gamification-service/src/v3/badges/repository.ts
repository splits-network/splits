/**
 * Badges V3 Repository — Read-only (badges are event-driven)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BadgeListParams } from './types.js';

const SORTABLE_FIELDS = ['awarded_at', 'created_at'];

export class BadgeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: BadgeListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('badges_awarded').select('*', { count: 'exact' });
    if (params.entity_type) query = query.eq('entity_type', params.entity_type);
    if (params.entity_id) query = query.eq('entity_id', params.entity_id);
    if (!params.include_revoked) query = query.is('revoked_at', null);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'awarded_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('badges_awarded').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }
}
