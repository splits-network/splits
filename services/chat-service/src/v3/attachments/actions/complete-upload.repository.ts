/**
 * Complete Upload Action Repository
 *
 * Data access for marking an attachment as uploaded.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatAttachment } from '../types.js';

export class CompleteUploadRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<ChatAttachment | null> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatAttachment | null;
  }

  async markPendingScan(id: string): Promise<ChatAttachment> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .update({ status: 'pending_scan', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChatAttachment;
  }
}
