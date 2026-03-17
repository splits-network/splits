/**
 * Conversations V3 Repository -- Core CRUD
 *
 * Flat select('*') on chat_conversations. NO joins, NO role logic.
 * Participant checks are helper queries on chat_conversation_participants.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ConversationListParams, ChatConversation } from './types';

export class ConversationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: ConversationListParams,
    userId: string,
  ): Promise<{ data: ChatConversation[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    // Get conversation IDs where user is a participant
    const { data: participantRows, error: pErr } = await this.supabase
      .from('chat_conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (pErr) throw pErr;
    const conversationIds = (participantRows || []).map((r: any) => r.conversation_id);

    if (conversationIds.length === 0) {
      return { data: [], total: 0 };
    }

    const query = this.supabase
      .from('chat_conversations')
      .select('*', { count: 'exact' })
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []) as ChatConversation[], total: count || 0 };
  }

  async findById(id: string): Promise<ChatConversation | null> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatConversation | null;
  }

  async create(record: Record<string, any>): Promise<ChatConversation> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as ChatConversation;
  }

  async update(id: string, updates: Record<string, any>): Promise<ChatConversation> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChatConversation;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
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
