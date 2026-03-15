/**
 * XP V3 Repository — Read-only (XP is event-driven)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { XpListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'points'];

export class XpRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: XpListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('xp_ledger').select('*', { count: 'exact' });
    if (params.entity_type) query = query.eq('entity_type', params.entity_type);
    if (params.entity_id) query = query.eq('entity_id', params.entity_id);
    if (params.source) query = query.eq('source', params.source);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('xp_ledger').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }
}
