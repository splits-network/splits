'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CommissionSegment {
    role: string;
    amount: number;
}

export function useCommissionData(trendPeriod: number = 12) {
    const { getToken } = useAuth();
    const [segments, setSegments] = useState<CommissionSegment[]>([]);
    const [total, setTotal] = useState(0);
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

            const response: any = await api.get('/charts/commission-breakdown', {
                params: {
                    scope: 'recruiter',
                    start_date: start.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                },
            });

            const chartData = response?.data?.data || response?.data || null;
            if (chartData?.labels && chartData?.datasets?.[0]?.data) {
                const mapped: CommissionSegment[] = chartData.labels.map((label: string, i: number) => ({
                    role: label,
                    amount: chartData.datasets[0].data[i] || 0,
                }));
                setSegments(mapped);
                setTotal(mapped.reduce((sum, s) => sum + s.amount, 0));
            } else {
                setSegments([]);
                setTotal(0);
            }
        } catch (err: any) {
            console.error('[CommissionData] Failed to load:', err);
            setError(err.message || 'Failed to load commission data');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trendPeriod]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { segments, total, loading, error, refresh };
}
