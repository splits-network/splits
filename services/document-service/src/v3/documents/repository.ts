/**
 * Documents V3 Repository — Core CRUD
 *
 * Single table queries on documents. NO joins, NO role logic.
 *
 * DB column mapping (DB → API response):
 *   filename → file_name
 *   storage_path → file_path
 *   content_type → mime_type
 *   bucket_name → storage_bucket
 *   uploaded_by_user_id → uploaded_by
 *   deleted_at → (used for soft-delete filtering)
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

    // Soft-delete filter (matches V2 behavior)
    if (!params.status || params.status === 'active') {
      query = query.is('deleted_at', null);
    } else if (params.status === 'deleted') {
      query = query.not('deleted_at', 'is', null);
    }
    // 'all' = no deleted_at filter

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
    return { data: (data || []).map(this.mapRow), total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapRow(data) : null;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data);
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

  /** Map DB column names to API-friendly names (matches V2 output) */
  private mapRow(row: any): any {
    return {
      id: row.id,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      document_type: row.document_type,
      file_name: row.filename,
      file_path: row.storage_path,
      file_size: row.file_size,
      mime_type: row.content_type,
      storage_bucket: row.bucket_name,
      uploaded_by: row.uploaded_by_user_id,
      status: row.deleted_at ? 'deleted' : 'active',
      processing_status: row.processing_status,
      scan_status: row.scan_status,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
