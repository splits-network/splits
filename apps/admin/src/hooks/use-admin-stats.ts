'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface AdminStats {
    // Identity
    totalUsers: number;
    totalRecruiters: number;
    pendingRecruiters: number;
    activeFraud: number;
    // ATS
    totalJobs: number;
    totalApplications: number;
    pendingApplications: number;
    // Network
    totalNetworkConnections: number;
    // Billing
    activeEscrow: number;
    pendingPayouts: number;
    totalRevenue: number;
    // Notifications
    activeNotifications: number;
}

const DEFAULT_STATS: AdminStats = {
    totalUsers: 0,
    totalRecruiters: 0,
    pendingRecruiters: 0,
    activeFraud: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalNetworkConnections: 0,
    activeEscrow: 0,
    pendingPayouts: 0,
    totalRevenue: 0,
    activeNotifications: 0,
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

export function useAdminStats(_timePeriod: TimePeriod = '30d'): AdminStatsResult {
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

        const [identity, ats, network, billing, notification] = await Promise.all([
            safeFetch(client, '/admin/identity/admin/counts'),
            safeFetch(client, '/admin/ats/admin/counts'),
            safeFetch(client, '/admin/network/admin/counts'),
            safeFetch(client, '/admin/billing/admin/counts'),
            safeFetch(client, '/admin/notification/admin/counts'),
        ]);

        setStats({
            totalUsers: (identity.totalUsers as number) ?? 0,
            totalRecruiters: (identity.totalRecruiters as number) ?? 0,
            pendingRecruiters: (identity.pendingRecruiters as number) ?? 0,
            activeFraud: (identity.activeFraud as number) ?? 0,
            totalJobs: (ats.totalJobs as number) ?? 0,
            totalApplications: (ats.totalApplications as number) ?? 0,
            pendingApplications: (ats.pendingApplications as number) ?? 0,
            totalNetworkConnections: (network.totalConnections as number) ?? 0,
            activeEscrow: (billing.activeEscrow as number) ?? 0,
            pendingPayouts: (billing.pendingPayouts as number) ?? 0,
            totalRevenue: (billing.totalRevenue as number) ?? 0,
            activeNotifications: (notification.activeNotifications as number) ?? 0,
        });

        setLoading(false);
    }, [getToken]);

    useEffect(() => {
        void fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}
