/**
 * Decline Action Repository
 *
 * Data access for declining a conversation request.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class DeclineActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async updateRequestState(conversationId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('chat_conversation_participants')
      .update({ request_state: 'declined', archived_at: now, updated_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async findOtherParticipant(conversationId: string, userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .neq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
