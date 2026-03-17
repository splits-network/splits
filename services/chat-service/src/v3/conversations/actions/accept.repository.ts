/**
 * Accept Action Repository
 *
 * Data access for accepting a conversation request.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class AcceptActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async updateRequestState(conversationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_conversation_participants')
      .update({ request_state: 'accepted', updated_at: new Date().toISOString() })
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
