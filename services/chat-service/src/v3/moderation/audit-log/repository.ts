/**
 * Audit Log V3 Repository -- Core CRUD
 *
 * Flat select('*') on chat_moderation_audit. NO joins.
 * Audit entries are created by the take-action action, not directly.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatModerationAudit, AuditLogListParams } from '../types.js';

const SORTABLE_FIELDS = ['created_at'];

export class AuditLogRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: AuditLogListParams): Promise<{ data: ChatModerationAudit[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const sortAscending = params.sort_order === 'asc';

    const query = this.supabase
      .from('chat_moderation_audit')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortAscending })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []) as ChatModerationAudit[], total: count || 0 };
  }

  async findById(id: string): Promise<ChatModerationAudit | null> {
    const { data, error } = await this.supabase
      .from('chat_moderation_audit')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatModerationAudit | null;
  }
}
