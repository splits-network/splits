import { SupabaseClient } from '@supabase/supabase-js';

export interface UserGrowthPoint {
    x: string;
    y: number;
}

export interface AdminChartDataResult {
    userGrowth: UserGrowthPoint[];
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

function formatBucketLabel(date: Date, period: string): string {
    const month = date.toLocaleString('en', { month: 'short' });
    if (period === '1y') return month;
    return `${month} ${date.getDate()}`;
}

async function countRowsInRange(
    supabase: SupabaseClient,
    table: string,
    from: string,
    to: string
): Promise<number> {
    const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .gte('created_at', from)
        .lt('created_at', to);
    return count || 0;
}

export async function getIdentityAdminChartData(
    supabase: SupabaseClient,
    period: string
): Promise<AdminChartDataResult> {
    const config = getPeriodConfig(period);
    const now = Date.now();

    if (period === 'all') {
        const { data: earliest } = await supabase
            .from('users')
            .select('created_at')
            .order('created_at', { ascending: true })
            .limit(1);

        const rangeStart = earliest?.[0]?.created_at
            ? new Date(earliest[0].created_at).getTime()
            : now - 365 * 86_400_000;
        const bucketMs = Math.max(1, Math.floor((now - rangeStart) / config.buckets));

        const bucketPromises = Array.from({ length: config.buckets }, async (_, i) => {
            const start = new Date(rangeStart + i * bucketMs);
            const end = new Date(Math.min(now, start.getTime() + bucketMs));
            const y = await countRowsInRange(supabase, 'users', start.toISOString(), end.toISOString());
            return { x: formatBucketLabel(start, period), y };
        });

        const userGrowth = await Promise.all(bucketPromises);
        return { userGrowth };
    }

    const periodMs = config.periodMs;
    const bucketMs = config.bucketMs;

    const bucketPromises = Array.from({ length: config.buckets }, async (_, i) => {
        const start = new Date(now - periodMs + i * bucketMs);
        const end = new Date(Math.min(now, start.getTime() + bucketMs));
        const y = await countRowsInRange(supabase, 'users', start.toISOString(), end.toISOString());
        return { x: formatBucketLabel(start, period), y };
    });

    const userGrowth = await Promise.all(bucketPromises);
    return { userGrowth };
}
