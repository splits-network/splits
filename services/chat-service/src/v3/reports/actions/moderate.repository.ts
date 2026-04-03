/**
 * Moderate Action Repository
 *
 * Updates report status and creates moderation audit records.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatReport } from '../types.js';

export interface ChatModerationAudit {
  id: string;
  actor_user_id: string;
  target_user_id: string;
  action: 'warn' | 'mute_user' | 'suspend_messaging' | 'ban_user';
  details: Record<string, any> | null;
  created_at: string;
}

export class ModerateActionRepository {
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

  async updateReportStatus(id: string, status: ChatReport['status']): Promise<ChatReport> {
    const { data, error } = await this.supabase
      .from('chat_reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChatReport;
  }

  async createModerationAudit(input: {
    actor_user_id: string;
    target_user_id: string;
    action: ChatModerationAudit['action'];
    details: Record<string, any> | null;
  }): Promise<ChatModerationAudit> {
    const { data, error } = await this.supabase
      .from('chat_moderation_audit')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as ChatModerationAudit;
  }
}
