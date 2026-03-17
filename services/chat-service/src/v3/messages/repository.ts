/**
 * Messages V3 Repository — Core CRUD
 *
 * Single table queries on chat_messages. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MessageListParams } from './types';

export class MessageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    conversationId: string,
    params: MessageListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId);

    if (params.after) {
      query = query.gt('id', params.after);
    }
    if (params.before) {
      query = query.lt('id', params.before);
    }

    query = query
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByClientMessageId(senderId: string, clientMessageId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('sender_id', senderId)
      .eq('client_message_id', clientMessageId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getOtherParticipants(conversationId: string, excludeUserId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('chat_conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', excludeUserId);

    if (error) throw error;
    return (data || []).map((r: any) => r.user_id);
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
}
