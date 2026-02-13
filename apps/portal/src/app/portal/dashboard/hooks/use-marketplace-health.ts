'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface MarketplaceHealth {
    labels: string[];
    values: number[];
    overallScore: number;
}

const DEFAULTS: MarketplaceHealth = {
    labels: ['Recruiter Activity', 'Company Engagement', 'Time-to-Fill', 'Fill Rate', 'Candidate Quality'],
    values: [0, 0, 0, 0, 0],
    overallScore: 0,
};

export function useMarketplaceHealth() {
    const { getToken } = useAuth();
    const [health, setHealth] = useState<MarketplaceHealth>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/charts/marketplace-health-radar', {
                params: { scope: 'platform' },
            });

            const chartData = response?.data?.data || response?.data || response;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const values = chartData.datasets[0].data as number[];
                const overallScore = values.length > 0
                    ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
                    : 0;
                setHealth({
                    labels: chartData.labels,
                    values,
                    overallScore,
                });
            }
        } catch (err: any) {
            console.error('[useMarketplaceHealth] Failed:', err);
            setError(err.message || 'Failed to load marketplace health');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { health, loading, error, refresh };
}
