/**
 * Evidence View Repository
 *
 * Fetches a report with its associated evidence messages (joined data).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatReport } from '../types.js';

export interface EvidenceMessage {
  id: string;
  sender_id: string;
  body: string | null;
  created_at: string;
  metadata: Record<string, any> | null;
}

export interface ReportWithEvidence {
  report: ChatReport;
  messages: EvidenceMessage[];
}

export class EvidenceViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findReportById(id: string): Promise<ChatReport | null> {
    const { data, error } = await this.supabase
      .from('chat_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatReport | null;
  }

  async findMessagesByIds(messageIds: string[]): Promise<EvidenceMessage[]> {
    if (messageIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('id, sender_id, body, created_at, metadata')
      .in('id', messageIds)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as EvidenceMessage[];
  }
}
