/**
 * Documents V3 Repository — Core CRUD
 *
 * Flat select('*') against the documents table. NO joins, NO aliasing.
 * Column aliasing for frontend-friendly names is handled by the
 * friendly-list view (views/friendly-list.route.ts).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { DocumentListParams } from './types';

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

    if (!params.status || params.status === 'active') {
      query = query.is('deleted_at', null);
    } else if (params.status === 'deleted') {
      query = query.not('deleted_at', 'is', null);
    }

    if (params.entity_type) query = query.eq('entity_type', params.entity_type);
    if (params.entity_id) query = query.eq('entity_id', params.entity_id);
    if (params.document_type) query = query.eq('document_type', params.document_type);
    if (params.uploaded_by) query = query.eq('uploaded_by_user_id', params.uploaded_by);
    if (params.search) {
      query = query.ilike('filename', `%${params.search}%`);
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
      .is('deleted_at', null)
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
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }
}
