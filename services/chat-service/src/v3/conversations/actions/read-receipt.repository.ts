/**
 * Read Receipt Action Repository
 *
 * Data access for marking a conversation as read via the chat_mark_read RPC.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class ReadReceiptActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async markRead(
    conversationId: string,
    userId: string,
    lastReadMessageId: string | null,
  ): Promise<void> {
    const { error } = await this.supabase.rpc('chat_mark_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
      p_last_read_message_id: lastReadMessageId,
    });

    if (error) throw error;
  }
}
