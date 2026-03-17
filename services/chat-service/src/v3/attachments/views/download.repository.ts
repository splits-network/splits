/**
 * Download View Repository
 *
 * Data access for retrieving attachment details for download URL generation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatAttachment } from '../types';

export class DownloadViewRepository {
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

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('chat_conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
}
