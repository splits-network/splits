'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface SpeedMetrics {
    avgDays: number;
    platformAvg: number;
}

export function useSpeedMetrics() {
    const { getToken } = useAuth();
    const [avgDays, setAvgDays] = useState(0);
    const [platformAvg, setPlatformAvg] = useState(0);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/charts/time-to-place-trends', {
                params: { scope: 'recruiter' },
            });

            const chartData = response?.data?.data || response?.data || null;

            if (chartData?.datasets?.[0]?.data) {
                const data = chartData.datasets[0].data as number[];
                // Most recent data point is current avg
                const recent = data.filter((d) => d > 0);
                const avg = recent.length > 0
                    ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
                    : 0;
                setAvgDays(avg);

                // Platform avg from second dataset if available, else estimate
                if (chartData.datasets[1]?.data) {
                    const platformData = chartData.datasets[1].data as number[];
                    const platformRecent = platformData.filter((d) => d > 0);
                    setPlatformAvg(
                        platformRecent.length > 0
                            ? Math.round(platformRecent.reduce((a, b) => a + b, 0) / platformRecent.length)
                            : 14,
                    );
                } else {
                    setPlatformAvg(14);
                }
            }
        } catch (err) {
            console.error('[SpeedMetrics] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { avgDays, platformAvg, loading, refresh };
}
