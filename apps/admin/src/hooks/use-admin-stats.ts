'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface StatMetric {
    total: number;
    sparkline: number[];
    trend: number;
}

export interface AdminStats {
    // From /admin/stats endpoints (have sparkline + trend)
    users: StatMetric;
    jobs: StatMetric;
    applications: StatMetric;
    recruiters: StatMetric;
    // From /admin/counts endpoints (totals only, no sparkline)
    pendingRecruiters: number;
    activeFraud: number;
    activeEscrow: number;
    pendingPayouts: number;
    activeNotifications: number;
    // Breakdown data for charts
    recruiterStatus: { label: string; value: number }[];
    applicationFunnel: { label: string; value: number }[];
}

const DEFAULT_STAT_METRIC: StatMetric = { total: 0, sparkline: [], trend: 0 };

const DEFAULT_STATS: AdminStats = {
    users: { ...DEFAULT_STAT_METRIC },
    jobs: { ...DEFAULT_STAT_METRIC },
    applications: { ...DEFAULT_STAT_METRIC },
    recruiters: { ...DEFAULT_STAT_METRIC },
    pendingRecruiters: 0,
    activeFraud: 0,
    activeEscrow: 0,
    pendingPayouts: 0,
    activeNotifications: 0,
    recruiterStatus: [],
    applicationFunnel: [],
};

export interface AdminStatsResult {
    stats: AdminStats;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

async function safeFetch(
    client: ReturnType<typeof createAuthenticatedClient>,
    path: string,
): Promise<Record<string, unknown>> {
    try {
        const res = await client.get<{ data: Record<string, unknown> }>(path);
        return (res as { data: Record<string, unknown> }).data ?? {};
    } catch {
        return {};
    }
}

function toStatMetric(raw: unknown): StatMetric {
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_STAT_METRIC };
    const r = raw as Record<string, unknown>;
    return {
        total: (r.total as number) ?? 0,
        sparkline: Array.isArray(r.sparkline) ? (r.sparkline as number[]) : [],
        trend: (r.trend as number) ?? 0,
    };
}

export function useAdminStats(timePeriod: TimePeriod = '30d'): AdminStatsResult {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        const token = await getToken().catch(() => null);
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const client = createAuthenticatedClient(token);
        const period = timePeriod;

        const [identityStats, atsStats, networkStats, identityCounts, billingCounts, notifCounts, networkCounts] =
            await Promise.all([
                safeFetch(client, `/identity/admin/stats?period=${period}`),
                safeFetch(client, `/ats/admin/stats?period=${period}`),
                safeFetch(client, `/network/admin/stats?period=${period}`),
                safeFetch(client, '/identity/admin/counts'),
                safeFetch(client, '/billing/admin/counts'),
                safeFetch(client, '/notification/admin/counts'),
                safeFetch(client, '/network/admin/counts'),
            ]);

        setStats({
            users: toStatMetric(identityStats.users),
            jobs: toStatMetric(atsStats.jobs),
            applications: toStatMetric(atsStats.applications),
            recruiters: toStatMetric(networkStats.recruiters),
            pendingRecruiters: (networkCounts.recruiters_pending as number) ?? 0,
            activeFraud: (identityCounts.activeFraud as number) ?? 0,
            activeEscrow: (billingCounts.activeEscrow as number) ?? 0,
            pendingPayouts: (billingCounts.pendingPayouts as number) ?? 0,
            activeNotifications: (notifCounts.activeNotifications as number) ?? 0,
            recruiterStatus: Array.isArray(networkStats.recruiterStatus)
                ? (networkStats.recruiterStatus as { label: string; value: number }[])
                : [],
            applicationFunnel: Array.isArray(atsStats.applicationFunnel)
                ? (atsStats.applicationFunnel as { label: string; value: number }[])
                : [],
        });

        setLoading(false);
    }, [getToken, timePeriod]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        void fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}
