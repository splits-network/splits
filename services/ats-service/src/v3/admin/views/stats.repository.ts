/**
 * Admin Stats View Repository
 * Sparkline metrics, trends, application funnel
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface StatMetric {
  sparkline: number[];
  trend: number;
  total: number;
}

export interface FunnelItem {
  label: string;
  value: number;
}

export interface AdminStatsResult {
  jobs: StatMetric;
  applications: StatMetric;
  applicationFunnel: FunnelItem[];
}

interface PeriodConfig {
  buckets: number;
  bucketMs: number;
  periodMs: number;
}

function getPeriodConfig(period: string): PeriodConfig {
  const DAY = 86_400_000;
  switch (period) {
    case '7d': return { buckets: 7, bucketMs: DAY, periodMs: 7 * DAY };
    case '90d': return { buckets: 10, bucketMs: 9 * DAY, periodMs: 90 * DAY };
    case '1y': return { buckets: 12, bucketMs: 30 * DAY, periodMs: 365 * DAY };
    case 'all': return { buckets: 10, bucketMs: 0, periodMs: 0 };
    default: return { buckets: 10, bucketMs: 3 * DAY, periodMs: 30 * DAY };
  }
}

const APPLICATION_STATUSES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

export class AdminStatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getStats(period: string): Promise<AdminStatsResult> {
    const [jobs, applications, applicationFunnel] = await Promise.all([
      this.buildSparklineAndTrend('jobs', period),
      this.buildSparklineAndTrend('applications', period),
      this.getApplicationFunnel(),
    ]);
    return { jobs, applications, applicationFunnel };
  }

  async getCounts(): Promise<Record<string, number>> {
    const [jobsRes, appsRes, candidatesRes, assignmentsRes, placementsRes] = await Promise.all([
      this.supabase.from('jobs').select('id', { count: 'exact', head: true }),
      this.supabase.from('applications').select('id', { count: 'exact', head: true }),
      this.supabase.from('candidates').select('id', { count: 'exact', head: true }),
      this.supabase.from('role_assignments').select('id', { count: 'exact', head: true }),
      this.supabase.from('placements').select('id', { count: 'exact', head: true }),
    ]);

    return {
      jobs: jobsRes.count || 0,
      applications: appsRes.count || 0,
      candidates: candidatesRes.count || 0,
      assignments: assignmentsRes.count || 0,
      placements: placementsRes.count || 0,
    };
  }

  private async buildSparklineAndTrend(table: string, period: string): Promise<StatMetric> {
    const config = getPeriodConfig(period);
    const now = Date.now();

    if (period === 'all') {
      const total = await this.countRows(table);
      const sparkline = Array(config.buckets).fill(Math.floor(total / config.buckets));
      return { sparkline, trend: 0, total };
    }

    const periodStart = new Date(now - config.periodMs).toISOString();
    const prevPeriodStart = new Date(now - config.periodMs * 2).toISOString();

    const bucketPromises = Array.from({ length: config.buckets }, (_, i) => {
      const start = new Date(now - config.periodMs + i * config.bucketMs).toISOString();
      const end = new Date(Math.min(now, now - config.periodMs + (i + 1) * config.bucketMs)).toISOString();
      return this.countRows(table, start, end);
    });

    const [buckets, prevCount, total] = await Promise.all([
      Promise.all(bucketPromises),
      this.countRows(table, prevPeriodStart, periodStart),
      this.countRows(table),
    ]);

    const currentTotal = buckets.reduce((a, b) => a + b, 0);
    const trend = prevCount === 0
      ? (currentTotal > 0 ? 100 : 0)
      : Math.round(((currentTotal - prevCount) / prevCount) * 100);

    return { sparkline: buckets, trend, total };
  }

  private async getApplicationFunnel(): Promise<FunnelItem[]> {
    return Promise.all(
      APPLICATION_STATUSES.map(async status => ({
        label: status,
        value: await this.countRowsByStatus('applications', status),
      })),
    );
  }

  private async countRows(table: string, from?: string, to?: string): Promise<number> {
    let q = this.supabase.from(table).select('id', { count: 'exact', head: true });
    if (from) q = q.gte('created_at', from);
    if (to) q = q.lt('created_at', to);
    const { count } = await q;
    return count || 0;
  }

  private async countRowsByStatus(table: string, status: string): Promise<number> {
    const { count } = await this.supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('status', status);
    return count || 0;
  }
}
