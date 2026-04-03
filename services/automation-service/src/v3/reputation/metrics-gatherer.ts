/**
 * V3 Reputation Metrics Gatherer
 *
 * Queries the database to gather all raw metrics needed for
 * reputation score calculation. Ported from V2 reputation/repository.ts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ReputationMetrics } from '../../v2/reputation/types.js';

export class MetricsGatherer {
  constructor(private supabase: SupabaseClient) {}

  async gather(recruiterId: string): Promise<ReputationMetrics> {
    const [submissions, hires, placements, collaborations, responseTime, expired, reached] =
      await Promise.all([
        this.countSubmissions(recruiterId),
        this.countHires(recruiterId),
        this.getPlacementCounts(recruiterId),
        this.countCollaborations(recruiterId),
        this.calculateAvgResponseTime(recruiterId),
        this.countExpiredInRecruiterStages(recruiterId),
        this.countReachedScreen(recruiterId),
      ]);

    return {
      total_submissions: submissions,
      total_hires: hires,
      ...placements,
      total_collaborations: collaborations,
      avg_response_time_hours: responseTime,
      total_expired_in_recruiter_stages: expired,
      total_reached_screen: reached,
    };
  }

  private async countSubmissions(recruiterId: string): Promise<number> {
    const stages = ['submitted', 'company_review', 'company_feedback', 'interview', 'offer', 'hired'];
    const { count, error } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_recruiter_id', recruiterId)
      .in('stage', stages);
    if (error) throw error;
    return count || 0;
  }

  private async countHires(recruiterId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_recruiter_id', recruiterId)
      .eq('stage', 'hired');
    if (error) throw error;
    return count || 0;
  }

  private async getPlacementCounts(recruiterId: string) {
    const { data: splits, error: sErr } = await this.supabase
      .from('placement_splits').select('placement_id').eq('recruiter_id', recruiterId);
    if (sErr) throw sErr;
    if (!splits?.length) return { total_placements: 0, completed_placements: 0, failed_placements: 0 };

    const ids = splits.map(s => s.placement_id);
    const { data: placements, error: pErr } = await this.supabase
      .from('placements').select('id, state').in('id', ids);
    if (pErr) throw pErr;

    return {
      total_placements: placements?.length || 0,
      completed_placements: placements?.filter(p => p.state === 'completed').length || 0,
      failed_placements: placements?.filter(p => p.state === 'failed').length || 0,
    };
  }

  private async countCollaborations(recruiterId: string): Promise<number> {
    const { data: mySplits, error } = await this.supabase
      .from('placement_splits').select('placement_id').eq('recruiter_id', recruiterId);
    if (error) throw error;
    if (!mySplits?.length) return 0;

    let count = 0;
    for (const split of mySplits) {
      const { count: splitCount, error: cErr } = await this.supabase
        .from('placement_splits')
        .select('*', { count: 'exact', head: true })
        .eq('placement_id', split.placement_id);
      if (cErr) throw cErr;
      if (splitCount && splitCount > 1) count++;
    }
    return count;
  }

  private async calculateAvgResponseTime(recruiterId: string): Promise<number | null> {
    const { data: apps, error: aErr } = await this.supabase
      .from('applications').select('id').eq('candidate_recruiter_id', recruiterId);
    if (aErr) throw aErr;
    if (!apps?.length) return null;

    const ids = apps.map(a => a.id);
    const { data: feedback, error: fErr } = await this.supabase
      .from('application_notes')
      .select('id, application_id, note_type, in_response_to_id, created_at')
      .in('application_id', ids)
      .in('note_type', ['info_request', 'info_response'])
      .order('created_at', { ascending: true });
    if (fErr) throw fErr;
    if (!feedback?.length) return null;

    const requestTimes = new Map<string, Date>();
    for (const f of feedback) {
      if (f.note_type === 'info_request') requestTimes.set(f.id, new Date(f.created_at));
    }

    const times: number[] = [];
    for (const f of feedback) {
      if (f.note_type === 'info_response' && f.in_response_to_id) {
        const reqTime = requestTimes.get(f.in_response_to_id);
        if (reqTime) {
          times.push((new Date(f.created_at).getTime() - reqTime.getTime()) / (1000 * 60 * 60));
        }
      }
    }

    if (!times.length) return null;
    return Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100;
  }

  private async countExpiredInRecruiterStages(recruiterId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_recruiter_id', recruiterId)
      .not('expired_at', 'is', null)
      .eq('stage', 'screen');
    if (error) throw error;
    return count || 0;
  }

  private async countReachedScreen(recruiterId: string): Promise<number> {
    const { data: apps, error: aErr } = await this.supabase
      .from('applications').select('id').eq('candidate_recruiter_id', recruiterId);
    if (aErr) throw aErr;
    if (!apps?.length) return 0;

    const ids = apps.map(a => a.id);
    const { data: logs, error: lErr } = await this.supabase
      .from('application_audit_log')
      .select('application_id')
      .in('application_id', ids)
      .eq('action', 'stage_changed')
      .filter('new_value->>stage', 'eq', 'screen');
    if (lErr) throw lErr;
    if (!logs) return 0;

    return new Set(logs.map(l => l.application_id)).size;
  }
}
