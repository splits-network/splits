'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface HeatmapDay {
    date: string; // YYYY-MM-DD
    count: number;
}

export function useSubmissionHeatmap(trendPeriod: number = 6) {
    const { getToken } = useAuth();
    const [days, setDays] = useState<HeatmapDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            const now = new Date();
            const start = new Date(now);
            start.setMonth(start.getMonth() - trendPeriod);

            const response: any = await api.get('/charts/submission-heatmap', {
                params: {
                    scope: 'recruiter',
                    start_date: start.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const mapped: HeatmapDay[] = chartData.labels.map((date: string, i: number) => ({
                    date,
                    count: chartData.datasets[0].data[i] || 0,
                }));
                setDays(mapped);
            } else {
                setDays([]);
            }
        } catch (err: any) {
            console.error('[SubmissionHeatmap] Failed to load:', err);
            setError(err.message || 'Failed to load heatmap data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trendPeriod]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { days, loading, error, refresh };
}
