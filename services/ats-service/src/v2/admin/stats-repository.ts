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

export interface AdminAtsStatsResult {
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
        default: return { buckets: 10, bucketMs: 3 * DAY, periodMs: 30 * DAY }; // 30d
    }
}

async function countRows(
    supabase: SupabaseClient,
    table: string,
    from?: string,
    to?: string
): Promise<number> {
    let q = supabase.from(table).select('id', { count: 'exact', head: true });
    if (from) q = q.gte('created_at', from);
    if (to) q = q.lt('created_at', to);
    const { count } = await q;
    return count || 0;
}

async function countRowsByStatus(
    supabase: SupabaseClient,
    table: string,
    status: string
): Promise<number> {
    const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('status', status);
    return count || 0;
}

async function buildSparklineAndTrend(
    supabase: SupabaseClient,
    table: string,
    period: string
): Promise<StatMetric> {
    const config = getPeriodConfig(period);
    const now = Date.now();

    if (period === 'all') {
        const total = await countRows(supabase, table);
        const sparkline = Array(config.buckets).fill(Math.floor(total / config.buckets));
        return { sparkline, trend: 0, total };
    }

    const periodStart = new Date(now - config.periodMs).toISOString();
    const prevPeriodStart = new Date(now - config.periodMs * 2).toISOString();

    const bucketCountPromises: Promise<number>[] = Array.from({ length: config.buckets }, (_, i) => {
        const start = new Date(now - config.periodMs + i * config.bucketMs).toISOString();
        const end = new Date(Math.min(now, now - config.periodMs + (i + 1) * config.bucketMs)).toISOString();
        return countRows(supabase, table, start, end);
    });

    const [buckets, prevCount, total] = await Promise.all([
        Promise.all(bucketCountPromises),
        countRows(supabase, table, prevPeriodStart, periodStart),
        countRows(supabase, table),
    ]);

    const currentTotal = buckets.reduce((a, b) => a + b, 0);
    const trend = prevCount === 0
        ? (currentTotal > 0 ? 100 : 0)
        : Math.round(((currentTotal - prevCount) / prevCount) * 100);

    return { sparkline: buckets, trend, total };
}

const APPLICATION_STATUSES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

async function getApplicationFunnel(supabase: SupabaseClient): Promise<FunnelItem[]> {
    const funnelPromises = APPLICATION_STATUSES.map(async status => ({
        label: status,
        value: await countRowsByStatus(supabase, 'applications', status),
    }));
    return Promise.all(funnelPromises);
}

export async function getAtsAdminStats(
    supabase: SupabaseClient,
    period: string
): Promise<AdminAtsStatsResult> {
    const [jobs, applications, applicationFunnel] = await Promise.all([
        buildSparklineAndTrend(supabase, 'jobs', period),
        buildSparklineAndTrend(supabase, 'applications', period),
        getApplicationFunnel(supabase),
    ]);
    return { jobs, applications, applicationFunnel };
}
