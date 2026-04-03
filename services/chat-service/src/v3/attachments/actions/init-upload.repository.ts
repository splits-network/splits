/**
 * Init Upload Action Repository
 *
 * Data access for creating a new attachment record.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatAttachment } from '../types.js';

export class InitUploadRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByIdempotencyKey(key: string): Promise<ChatAttachment | null> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) throw error;
    return data as ChatAttachment | null;
  }

  async createAttachment(input: {
    conversation_id: string;
    uploader_id: string;
    file_name: string;
    content_type: string;
    size_bytes: number;
    storage_key: string;
    idempotency_key?: string | null;
  }): Promise<ChatAttachment> {
    const record: Record<string, any> = {
      conversation_id: input.conversation_id,
      uploader_id: input.uploader_id,
      file_name: input.file_name,
      content_type: input.content_type,
      size_bytes: input.size_bytes,
      storage_key: input.storage_key,
      status: 'pending_upload',
    };
    if (input.idempotency_key) {
      record.idempotency_key = input.idempotency_key;
    }

    const { data, error } = await this.supabase
      .from('chat_attachments')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as ChatAttachment;
  }

  async getParticipantState(conversationId: string, userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_conversation_participants')
      .select('conversation_id, user_id, request_state')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
