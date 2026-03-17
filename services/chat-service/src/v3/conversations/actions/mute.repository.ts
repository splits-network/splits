/**
 * Mute Action Repository
 *
 * Data access for toggling mute state on a conversation.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class MuteActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async updateMuteState(conversationId: string, userId: string, muted: boolean): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('chat_conversation_participants')
      .update({ muted_at: muted ? now : null, updated_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
