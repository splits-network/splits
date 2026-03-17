'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface PlacementMonth {
    month: string;
    count: number;
}

export function useCompanyPlacementTrend(months: number = 6) {
    const { getToken } = useAuth();
    const [data, setData] = useState<PlacementMonth[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            const now = new Date();
            const start = new Date(now);
            start.setMonth(start.getMonth() - months);

            const response: any = await api.get('/charts/placement-trends', {
                params: {
                    scope: 'company',
                    start_date: start.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const mapped: PlacementMonth[] = chartData.labels.map(
                    (label: string, i: number) => ({
                        month: label,
                        count: chartData.datasets[0].data[i] || 0,
                    }),
                );
                setData(mapped);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error('[CompanyPlacementTrend] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [months]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { data, loading, refresh };
}
