/**
 * Call Stats V3 Repository
 * Aggregated stats queries
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CallStats } from './types.js';

export class StatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCallStats(userId: string, entityType?: string, entityId?: string): Promise<CallStats> {
    const now = new Date();

    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let callIds: string[];

    if (entityType && entityId) {
      const { data: entityLinks, error } = await this.supabase
        .from('call_entity_links')
        .select('call_id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
      if (error) throw error;
      callIds = (entityLinks || []).map((l: { call_id: string }) => l.call_id);
    } else {
      const { data: participantLinks, error } = await this.supabase
        .from('call_participants')
        .select('call_id')
        .eq('user_id', userId);
      if (error) throw error;
      callIds = (participantLinks || []).map((p: { call_id: string }) => p.call_id);
    }

    if (callIds.length === 0) {
      return { upcoming_count: 0, this_week_count: 0, this_month_count: 0, avg_duration_minutes: 0, needs_follow_up_count: 0 };
    }

    const [upcoming, thisWeek, thisMonth, avgDuration, followUp] = await Promise.all([
      this.supabase.from('calls').select('id', { count: 'exact', head: true })
        .in('id', callIds).eq('status', 'scheduled').gt('scheduled_at', now.toISOString()).is('deleted_at', null),
      this.supabase.from('calls').select('id', { count: 'exact', head: true })
        .in('id', callIds).eq('status', 'completed').gte('ended_at', weekStart.toISOString()).is('deleted_at', null),
      this.supabase.from('calls').select('id', { count: 'exact', head: true })
        .in('id', callIds).eq('status', 'completed').gte('ended_at', monthStart.toISOString()).is('deleted_at', null),
      this.supabase.from('calls').select('duration_minutes')
        .in('id', callIds).eq('status', 'completed').not('duration_minutes', 'is', null).is('deleted_at', null),
      this.supabase.from('calls').select('id', { count: 'exact', head: true })
        .in('id', callIds).eq('needs_follow_up', true).is('deleted_at', null),
    ]);

    if (upcoming.error) throw upcoming.error;
    if (thisWeek.error) throw thisWeek.error;
    if (thisMonth.error) throw thisMonth.error;
    if (avgDuration.error) throw avgDuration.error;
    if (followUp.error) throw followUp.error;

    const durations = (avgDuration.data || []) as { duration_minutes: number }[];
    const avgMinutes = durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d.duration_minutes, 0) / durations.length)
      : 0;

    return {
      upcoming_count: upcoming.count || 0,
      this_week_count: thisWeek.count || 0,
      this_month_count: thisMonth.count || 0,
      avg_duration_minutes: avgMinutes,
      needs_follow_up_count: followUp.count || 0,
    };
  }
}
