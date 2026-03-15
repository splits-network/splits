/**
 * Call Scheduler Repository — V3
 * Database queries for reminders, timeouts, and no-shows.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const REMINDER_RANGES: Record<string, [number, number]> = {
  '24h': [23 * 3600000, 25 * 3600000],
  '1h': [55 * 60000, 65 * 60000],
  '5min': [4 * 60000, 6 * 60000],
};

export class SchedulerRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCallsNeedingReminder(type: '24h' | '1h' | '5min') {
    const now = Date.now();
    const [lo, hi] = REMINDER_RANGES[type];
    const rangeStart = new Date(now + lo).toISOString();
    const rangeEnd = new Date(now + hi).toISOString();

    const { data: calls, error } = await this.supabase
      .from('calls')
      .select('id, call_type, title, scheduled_at')
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', rangeStart)
      .lte('scheduled_at', rangeEnd)
      .is('deleted_at', null);
    if (error) throw error;
    if (!calls?.length) return [];

    const callIds = calls.map((c: any) => c.id);
    const sentIds = await this.getSentReminderIds(callIds, type);
    const unsent = calls.filter((c: any) => !sentIds.has(c.id));
    if (!unsent.length) return [];

    return this.enrichWithParticipants(unsent);
  }

  async markReminderSent(callId: string, type: string): Promise<void> {
    const { error } = await this.supabase
      .from('call_reminders_sent')
      .insert({ call_id: callId, reminder_type: type });
    if (error) throw error;
  }

  async getTimedOutInstantCalls(): Promise<string[]> {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    const { data: calls, error } = await this.supabase
      .from('calls')
      .select('id')
      .eq('status', 'scheduled')
      .is('scheduled_at', null)
      .lt('created_at', fiveMinAgo)
      .is('deleted_at', null);
    if (error) throw error;
    if (!calls?.length) return [];
    return this.filterUnjoinedCalls(calls.map((c: any) => c.id));
  }

  async getNoShowScheduledCalls(): Promise<string[]> {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60000).toISOString();
    const { data: calls, error } = await this.supabase
      .from('calls')
      .select('id')
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null)
      .lt('scheduled_at', fifteenMinAgo)
      .is('deleted_at', null);
    if (error) throw error;
    if (!calls?.length) return [];
    return this.filterUnjoinedCalls(calls.map((c: any) => c.id));
  }

  async markStatus(callId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('calls')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', callId);
    if (error) throw error;
  }

  // ── Private ───────────────────────────────────────────────────────────

  private async getSentReminderIds(callIds: string[], type: string): Promise<Set<string>> {
    const { data, error } = await this.supabase
      .from('call_reminders_sent')
      .select('call_id')
      .in('call_id', callIds)
      .eq('reminder_type', type);
    if (error) throw error;
    return new Set((data || []).map((r: any) => r.call_id));
  }

  private async filterUnjoinedCalls(callIds: string[]): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('call_participants')
      .select('call_id')
      .in('call_id', callIds)
      .not('joined_at', 'is', null);
    if (error) throw error;
    const joinedIds = new Set((data || []).map((p: any) => p.call_id));
    return callIds.filter(id => !joinedIds.has(id));
  }

  private async enrichWithParticipants(calls: any[]) {
    const callIds = calls.map((c: any) => c.id);
    const { data: parts, error: pErr } = await this.supabase
      .from('call_participants')
      .select('call_id, user_id, role')
      .in('call_id', callIds);
    if (pErr) throw pErr;

    const userIds = [...new Set((parts || []).map((p: any) => p.user_id))];
    const userMap = new Map<string, { name: string; email: string }>();

    if (userIds.length > 0) {
      const { data: users, error: uErr } = await this.supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);
      if (uErr) throw uErr;
      for (const u of users || []) {
        userMap.set(u.id, { name: u.name || '', email: u.email || '' });
      }
    }

    const defaultUser = { name: '', email: '' };
    return calls.map(call => ({
      ...call,
      participants: (parts || [])
        .filter((p: any) => p.call_id === call.id)
        .map((p: any) => ({
          user_id: p.user_id,
          role: p.role,
          ...(userMap.get(p.user_id) || defaultUser),
        })),
    }));
  }
}
