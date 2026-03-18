/**
 * Support Messages Repository — Sub-resource CRUD
 *
 * Queries against support_messages table only.
 * Separated from conversation repository per V3 compliance.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class SupportMessageRepository {
  constructor(private supabase: SupabaseClient) {}

  async listByConversation(
    conversationId: string,
    limit: number = 50,
    before?: string,
  ): Promise<any[]> {
    let query = this.supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async create(
    conversationId: string,
    senderType: 'visitor' | 'admin' | 'system',
    senderId: string | null,
    body: string,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: senderType,
        sender_id: senderId,
        body,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
