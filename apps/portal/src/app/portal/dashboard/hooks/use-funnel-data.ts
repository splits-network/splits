'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface FunnelStage {
    label: string;
    count: number;
    color: string;
}

const STAGE_COLORS: Record<string, string> = {
    Screen: 'bg-info',
    Submitted: 'bg-primary',
    Interview: 'bg-accent',
    Offer: 'bg-warning',
    Hired: 'bg-success',
};

export function useFunnelData(trendPeriod: number = 12) {
    const { getToken } = useAuth();
    const [stages, setStages] = useState<FunnelStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            const now = new Date();
            const start = new Date(now);
            start.setMonth(start.getMonth() - trendPeriod);

            const response: any = await api.get('/charts/recruitment-funnel', {
                params: {
                    scope: 'recruiter',
                    start_date: start.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const mapped: FunnelStage[] = chartData.labels.map((label: string, i: number) => ({
                    label,
                    count: chartData.datasets[0].data[i] || 0,
                    color: STAGE_COLORS[label] || 'bg-base-300',
                }));
                setStages(mapped);
            } else {
                setStages([]);
            }
        } catch (err: any) {
            console.error('[FunnelData] Failed to load:', err);
            setError(err.message || 'Failed to load funnel data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trendPeriod]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { stages, loading, error, refresh };
}
