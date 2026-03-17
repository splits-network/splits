/**
 * Submit Action Repository
 *
 * Creates a report and fetches recent messages as evidence.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatReport } from '../types';

export class SubmitActionRepository {
  constructor(private supabase: SupabaseClient) {}

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

  async fetchRecentMessageIds(conversationId: string, limit: number = 20): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((m: any) => m.id);
  }

  async createReport(input: {
    reporter_user_id: string;
    reported_user_id: string;
    conversation_id: string;
    category: string;
    description: string | null;
    evidence_pointer: string | null;
  }): Promise<ChatReport> {
    const { data, error } = await this.supabase
      .from('chat_reports')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as ChatReport;
  }
}
