'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface ReputationMetrics {
    speed: number;
    volume: number;
    quality: number;
    collaboration: number;
    consistency: number;
}

const DEFAULT_METRICS: ReputationMetrics = {
    speed: 0,
    volume: 0,
    quality: 0,
    collaboration: 0,
    consistency: 0,
};

export function useReputationData() {
    const { getToken } = useAuth();
    const [metrics, setMetrics] = useState<ReputationMetrics>(DEFAULT_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/charts/reputation-radar', {
                params: { scope: 'recruiter' },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const data = chartData.datasets[0].data;
                setMetrics({
                    speed: data[0] || 0,
                    volume: data[1] || 0,
                    quality: data[2] || 0,
                    collaboration: data[3] || 0,
                    consistency: data[4] || 0,
                });
            } else {
                setMetrics(DEFAULT_METRICS);
            }
        } catch (err: any) {
            console.error('[ReputationData] Failed to load:', err);
            setError(err.message || 'Failed to load reputation data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { metrics, loading, error, refresh };
}
