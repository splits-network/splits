/**
 * Documents V3 Repository — Read + Update
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { DocumentListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'processing_status'];

export class DocumentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: DocumentListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('documents').select('*', { count: 'exact' });
    if (params.processing_status) query = query.eq('processing_status', params.processing_status);
    if (params.scan_status) query = query.eq('scan_status', params.scan_status);
    if (params.entity_type) query = query.eq('entity_type', params.entity_type);
    if (params.entity_id) query = query.eq('entity_id', params.entity_id);
    if (params.search) query = query.ilike('filename', `%${params.search}%`);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('documents').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('documents')
      .update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
}
