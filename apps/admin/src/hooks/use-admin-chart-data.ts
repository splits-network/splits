'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { TimePeriod } from '@/hooks/use-admin-stats';

export interface ChartDataResult {
    userGrowth: { x: string; y: number }[];
    jobPostings: { label: string; value: number }[];
    applicationVolume: { x: string; y: number }[];
    hiringFunnel: { name: string; data: number[] }[];
    hiringFunnelLabels: string[];
    loading: boolean;
    error: string | null;
}

const DEFAULT_CHART_DATA: ChartDataResult = {
    userGrowth: [],
    jobPostings: [],
    applicationVolume: [],
    hiringFunnel: [],
    hiringFunnelLabels: [],
    loading: true,
    error: null,
};

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

export function useAdminChartData(period: TimePeriod): ChartDataResult {
    const { getToken } = useAuth();
    const [chartData, setChartData] = useState<ChartDataResult>(DEFAULT_CHART_DATA);

    const fetchChartData = useCallback(async () => {
        const token = await getToken().catch(() => null);
        if (!token) {
            setChartData((prev) => ({ ...prev, loading: false, error: 'Not authenticated' }));
            return;
        }

        setChartData((prev) => ({ ...prev, loading: true, error: null }));

        const client = createAuthenticatedClient(token);

        const [identityChart, atsChart] = await Promise.all([
            safeFetch(client, `/admin/identity/admin/chart-data?period=${period}`),
            safeFetch(client, `/admin/ats/admin/chart-data?period=${period}`),
        ]);

        setChartData({
            userGrowth: Array.isArray(identityChart.userGrowth)
                ? (identityChart.userGrowth as { x: string; y: number }[])
                : [],
            jobPostings: Array.isArray(atsChart.jobPostings)
                ? (atsChart.jobPostings as { label: string; value: number }[])
                : [],
            applicationVolume: Array.isArray(atsChart.applicationVolume)
                ? (atsChart.applicationVolume as { x: string; y: number }[])
                : [],
            hiringFunnel: Array.isArray(atsChart.hiringFunnel)
                ? (atsChart.hiringFunnel as { name: string; data: number[] }[])
                : [],
            hiringFunnelLabels: Array.isArray(atsChart.hiringFunnelLabels)
                ? (atsChart.hiringFunnelLabels as string[])
                : [],
            loading: false,
            error: null,
        });
    }, [getToken, period]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        void fetchChartData();
    }, [fetchChartData]);

    return chartData;
}
