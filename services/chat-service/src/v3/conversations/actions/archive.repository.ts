/**
 * Archive Action Repository
 *
 * Data access for toggling archive state on a conversation.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class ArchiveActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async updateArchiveState(conversationId: string, userId: string, archived: boolean): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('chat_conversation_participants')
      .update({ archived_at: archived ? now : null, updated_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
