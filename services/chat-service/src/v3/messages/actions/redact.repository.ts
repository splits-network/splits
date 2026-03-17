/**
 * Redact Action Repository
 *
 * Data access for admin message redaction.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class RedactActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(messageId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async redact(
    messageId: string,
    payload: {
      body?: string | null;
      edited_at?: string;
      redacted_at: string;
      redaction_reason: string | null;
    },
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .update(payload)
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
