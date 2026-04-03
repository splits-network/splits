/**
 * Embeddings V3 Repository — Read-only
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'updated_at'];

export class EmbeddingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: EmbeddingListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('embeddings')
      .select('id, entity_type, entity_id, text_hash, model, created_at, updated_at', { count: 'exact' });

    if (params.entity_type) query = query.eq('entity_type', params.entity_type);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('embeddings')
      .select('id, entity_type, entity_id, text_hash, model, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
