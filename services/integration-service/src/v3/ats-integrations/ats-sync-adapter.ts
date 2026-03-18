/**
 * ATS Sync Adapter — Sync log, sync queue, stats
 *
 * Split from ATSRepositoryAdapter to keep files under 200 lines.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { SyncLog, SyncQueueItem } from '@splits-network/shared-types';

export class ATSSyncAdapter {
  protected supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /* ── Sync Log ─────────────────────────────────────────────────────── */

  async createSyncLog(log: Omit<SyncLog, 'id' | 'synced_at'>): Promise<SyncLog> {
    const { data, error } = await this.supabase
      .from('ats_sync_log')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listSyncLogs(
    integrationId: string,
    opts: { limit?: number; offset?: number; status?: string } = {},
  ): Promise<SyncLog[]> {
    let query = this.supabase
      .from('ats_sync_log')
      .select('*')
      .eq('integration_id', integrationId)
      .order('synced_at', { ascending: false });

    if (opts.status) query = query.eq('status', opts.status);
    if (opts.limit) query = query.limit(opts.limit);
    if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  /* ── Sync Queue ───────────────────────────────────────────────────── */

  async enqueue(item: Omit<SyncQueueItem, 'id' | 'created_at'>): Promise<SyncQueueItem> {
    const { data, error } = await this.supabase
      .from('ats_sync_queue')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async dequeuePending(integrationId: string, limit: number = 10): Promise<SyncQueueItem[]> {
    const { data, error } = await this.supabase
      .from('ats_sync_queue')
      .select('*')
      .eq('integration_id', integrationId)
      .eq('status', 'pending')
      .order('priority')
      .order('scheduled_at')
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  async updateQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const { error } = await this.supabase
      .from('ats_sync_queue')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  /* ── Stats ────────────────────────────────────────────────────────── */

  async getSyncStats(integrationId: string) {
    const [logsRes, pendingRes] = await Promise.all([
      this.supabase
        .from('ats_sync_log')
        .select('status', { count: 'exact' })
        .eq('integration_id', integrationId),
      this.supabase
        .from('ats_sync_queue')
        .select('*', { count: 'exact', head: true })
        .eq('integration_id', integrationId)
        .eq('status', 'pending'),
    ]);

    const logs = logsRes.data ?? [];
    const total = logsRes.count ?? 0;
    const successful = logs.filter(l => l.status === 'success').length;
    const failed = logs.filter(l => l.status === 'failed').length;

    return {
      total_syncs: total,
      successful_syncs: successful,
      failed_syncs: failed,
      pending_queue_items: pendingRes.count ?? 0,
    };
  }
}
