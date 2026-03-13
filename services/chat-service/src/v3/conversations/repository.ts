/**
 * Conversations V3 Repository — Core CRUD
 *
 * Single table queries on chat_conversations. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ConversationListParams } from './types';

export class ConversationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: ConversationListParams,
    userId: string,
  ): Promise<{ data: any[]; total: number }> {
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

    let query = this.supabase
      .from('chat_conversations')
      .select('*', { count: 'exact' })
      .in('id', conversationIds);

    if (params.search) {
      query = query.ilike('subject', `%${params.search}%`);
    }

    query = query
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_conversations')
      .update({ archived: true })
      .eq('id', id);

    if (error) throw error;
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('chat_conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async addParticipants(conversationId: string, userIds: string[]): Promise<void> {
    const rows = userIds.map((userId) => ({
      conversation_id: conversationId,
      user_id: userId,
    }));

    const { error } = await this.supabase
      .from('chat_conversation_participants')
      .upsert(rows, { onConflict: 'conversation_id,user_id' });

    if (error) throw error;
  }
}
