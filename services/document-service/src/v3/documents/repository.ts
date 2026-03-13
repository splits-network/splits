/**
 * Documents V3 Repository — Core CRUD
 *
 * Single table queries on documents. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { DocumentListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'file_name', 'file_size', 'document_type'];

export class DocumentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: DocumentListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('documents')
      .select('*', { count: 'exact' });

    if (params.entity_type) query = query.eq('entity_type', params.entity_type);
    if (params.entity_id) query = query.eq('entity_id', params.entity_id);
    if (params.document_type) query = query.eq('document_type', params.document_type);
    if (params.search) {
      query = query.ilike('file_name', `%${params.search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw error;
  }
}
