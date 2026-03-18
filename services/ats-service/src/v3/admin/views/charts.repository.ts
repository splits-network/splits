/**
 * Admin Charts View Repository
 * Job postings bar chart, application volume line, hiring funnel
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface BarChartPoint {
  label: string;
  value: number;
}

export interface LineChartPoint {
  x: string;
  y: number;
}

export interface HiringFunnelSeries {
  name: string;
  data: number[];
}

export interface AdminChartDataResult {
  jobPostings: BarChartPoint[];
  applicationVolume: LineChartPoint[];
  hiringFunnel: HiringFunnelSeries[];
  hiringFunnelLabels: string[];
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

function formatBucketLabel(date: Date, period: string): string {
  const month = date.toLocaleString('en', { month: 'short' });
  if (period === '1y') return month;
  return `${month} ${date.getDate()}`;
}

export class AdminChartsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getChartData(period: string): Promise<AdminChartDataResult> {
    const config = getPeriodConfig(period);
    const now = Date.now();
    const periodMs = config.periodMs || 30 * 86_400_000;
    const bucketMs = config.bucketMs || Math.floor(periodMs / config.buckets);

    const buckets = Array.from({ length: config.buckets }, (_, i) => {
      const start = new Date(now - periodMs + i * bucketMs);
      const end = new Date(Math.min(now, start.getTime() + bucketMs));
      return {
        start: start.toISOString(),
        end: end.toISOString(),
        label: formatBucketLabel(start, period),
      };
    });

    const [jobPostings, applicationVolume, interviewCounts, hireCounts] = await Promise.all([
      Promise.all(
        buckets.map(async b => ({
          label: b.label,
          value: await this.countInRange('jobs', b.start, b.end),
        })),
      ),
      Promise.all(
        buckets.map(async b => ({
          x: b.label,
          y: await this.countInRange('applications', b.start, b.end),
        })),
      ),
      Promise.all(
        buckets.map(b =>
          this.countInRange('applications', b.start, b.end, ['interview', 'offer', 'hired']),
        ),
      ),
      Promise.all(
        buckets.map(b =>
          this.countInRange('applications', b.start, b.end, ['hired']),
        ),
      ),
    ]);

    const hiringFunnelLabels = buckets.map(b => b.label);
    const hiringFunnel: HiringFunnelSeries[] = [
      { name: 'Applications', data: applicationVolume.map(p => p.y) },
      { name: 'Interviews', data: interviewCounts },
      { name: 'Hires', data: hireCounts },
    ];

    return { jobPostings, applicationVolume, hiringFunnel, hiringFunnelLabels };
  }

  private async countInRange(
    table: string,
    from: string,
    to: string,
    statusFilter?: string[],
  ): Promise<number> {
    let q = this.supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', from)
      .lt('created_at', to);
    if (statusFilter) q = q.in('status', statusFilter);
    const { count } = await q;
    return count || 0;
  }
}
