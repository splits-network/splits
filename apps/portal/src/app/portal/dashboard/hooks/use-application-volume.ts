'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface ApplicationVolumePoint {
    period: string;
    count: number;
}

export function useApplicationVolume(months: number = 12) {
    const { getToken } = useAuth();
    const [data, setData] = useState<ApplicationVolumePoint[]>([]);
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
            start.setMonth(start.getMonth() - months);

            const response: any = await api.get('/charts/application-trends', {
                params: {
                    scope: 'company',
                    start_date: start.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const mapped: ApplicationVolumePoint[] = chartData.labels.map(
                    (label: string, i: number) => ({
                        period: label,
                        count: chartData.datasets[0].data[i] || 0,
                    })
                );
                setData(mapped);
            } else {
                setData([]);
            }
        } catch (err: any) {
            console.error('[ApplicationVolume] Failed to load:', err);
            setError(err.message || 'Failed to load application volume data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [months]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
}
