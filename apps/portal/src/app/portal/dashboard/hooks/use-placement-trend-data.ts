'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface PlacementTrendDataPoint {
    month: string;
    count: number;
}

export function usePlacementTrendData(months: number = 6) {
    const { getToken } = useAuth();
    const [data, setData] = useState<PlacementTrendDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/charts/placement-trends', {
                params: {
                    months,
                    scope: 'recruiter'
                },
            });

            // Transform Chart.js format to simple array format
            const chartData = response?.data?.data;
            if (chartData && chartData.labels && chartData.datasets?.[0]?.data) {
                const transformed = chartData.labels.map((label: string, index: number) => ({
                    month: label,
                    count: chartData.datasets[0].data[index] || 0,
                }));
                setData(transformed);
            } else {
                setData([]);
            }
        } catch (err: any) {
            console.error('[PlacementTrendData] Failed to load:', err);
            setError(err.message || 'Failed to load placement trend data');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [getToken, months]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
}
