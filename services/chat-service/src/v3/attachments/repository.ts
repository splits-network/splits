/**
 * Attachments V3 Repository -- Core CRUD
 *
 * Flat select('*') on chat_attachments. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatAttachment, AttachmentListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'updated_at', 'file_name'];
const ALLOWED_FIELDS = [
  'id', 'conversation_id', 'message_id', 'uploader_id', 'file_name',
  'content_type', 'size_bytes', 'storage_key', 'status', 'scan_result',
  'created_at', 'updated_at',
];

export class AttachmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: AttachmentListParams,
  ): Promise<{ data: ChatAttachment[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    // Field selection: validate against known columns to prevent injection
    let selectFields = '*';
    if (params.fields) {
      const requested = params.fields.split(',').filter((f) => ALLOWED_FIELDS.includes(f));
      if (requested.length > 0) {
        selectFields = requested.join(',');
      }
    }

    let query = this.supabase
      .from('chat_attachments')
      .select(selectFields, { count: 'exact' }) as any;

    if (params.conversation_id) {
      query = query.eq('conversation_id', params.conversation_id);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const sortAscending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending: sortAscending });

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []) as ChatAttachment[], total: count || 0 };
  }

  async findById(id: string): Promise<ChatAttachment | null> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatAttachment | null;
  }

  async create(record: Record<string, any>): Promise<ChatAttachment> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as ChatAttachment;
  }

  async update(id: string, updates: Record<string, any>): Promise<ChatAttachment> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChatAttachment;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_attachments')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
