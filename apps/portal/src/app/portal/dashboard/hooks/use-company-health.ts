'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CompanyHealthMetrics {
    timeToFill: number;
    candidateFlow: number;
    interviewRate: number;
    offerRate: number;
    fillRate: number;
}

const DEFAULT_METRICS: CompanyHealthMetrics = {
    timeToFill: 0,
    candidateFlow: 0,
    interviewRate: 0,
    offerRate: 0,
    fillRate: 0,
};

export function useCompanyHealth() {
    const { getToken } = useAuth();
    const [metrics, setMetrics] = useState<CompanyHealthMetrics>(DEFAULT_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/charts/company-health-radar', {
                params: { scope: 'company' },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const data = chartData.datasets[0].data;
                setMetrics({
                    timeToFill: data[0] || 0,
                    candidateFlow: data[1] || 0,
                    interviewRate: data[2] || 0,
                    offerRate: data[3] || 0,
                    fillRate: data[4] || 0,
                });
            } else {
                setMetrics(DEFAULT_METRICS);
            }
        } catch (err: any) {
            console.error('[CompanyHealth] Failed to load:', err);
            setError(err.message || 'Failed to load health data');
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
