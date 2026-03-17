/**
 * Metrics View Repository
 *
 * Multi-table count aggregation for admin dashboard.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ModerationMetrics } from '../types';

export class MetricsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getMetrics(rangeDays: number): Promise<ModerationMetrics> {
    const sinceDate = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);
    const since = sinceDate.toISOString();

    const countRows = async (
      table: string,
      filters: Array<{ key: string; op: 'eq' | 'neq' | 'gte' | 'not' | 'is'; value: any }>,
    ) => {
      let query = this.supabase.from(table).select('id', { count: 'exact', head: true });
      for (const filter of filters) {
        if (filter.op === 'eq') query = query.eq(filter.key, filter.value);
        else if (filter.op === 'neq') query = query.neq(filter.key, filter.value);
        else if (filter.op === 'gte') query = query.gte(filter.key, filter.value);
        else if (filter.op === 'is') query = query.is(filter.key, filter.value);
        else if (filter.op === 'not') query = query.not(filter.key, 'is', filter.value);
      }
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    };

    const [
      messages,
      conversations,
      reports,
      blocks,
      attachments,
      attachmentsBlocked,
      redactions,
      moderationActions,
      pendingRequests,
      declinedRequests,
    ] = await Promise.all([
      countRows('chat_messages', [{ key: 'created_at', op: 'gte', value: since }]),
      countRows('chat_conversations', [{ key: 'created_at', op: 'gte', value: since }]),
      countRows('chat_reports', [{ key: 'created_at', op: 'gte', value: since }]),
      countRows('chat_user_blocks', [{ key: 'created_at', op: 'gte', value: since }]),
      countRows('chat_attachments', [{ key: 'created_at', op: 'gte', value: since }]),
      countRows('chat_attachments', [
        { key: 'created_at', op: 'gte', value: since },
        { key: 'status', op: 'eq', value: 'blocked' },
      ]),
      countRows('chat_messages', [
        { key: 'created_at', op: 'gte', value: since },
        { key: 'redacted_at', op: 'not', value: null },
      ]),
      countRows('chat_moderation_audit', [{ key: 'created_at', op: 'gte', value: since }]),
      countRows('chat_conversation_participants', [
        { key: 'request_state', op: 'eq', value: 'pending' },
      ]),
      countRows('chat_conversation_participants', [
        { key: 'request_state', op: 'eq', value: 'declined' },
      ]),
    ]);

    const { data: lastRetention } = await this.supabase
      .from('chat_retention_runs')
      .select('started_at, completed_at, status, messages_redacted, attachments_deleted, audits_archived')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      rangeDays,
      since,
      totals: {
        messages,
        conversations,
        reports,
        blocks,
        attachments,
        attachments_blocked: attachmentsBlocked,
        redactions,
        moderation_actions: moderationActions,
      },
      requests: {
        pending: pendingRequests,
        declined: declinedRequests,
      },
      retention: {
        last_run_at: lastRetention?.completed_at || lastRetention?.started_at || null,
        last_status: lastRetention?.status || null,
        messages_redacted: lastRetention?.messages_redacted || 0,
        attachments_deleted: lastRetention?.attachments_deleted || 0,
        audits_archived: lastRetention?.audits_archived || 0,
      },
    };
  }
}
