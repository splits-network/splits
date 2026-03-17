'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CostMetrics {
    spendYtd: number;
    costPerHire: number;
    avgFeePercent: number;
}

export interface MonthlySpend {
    month: string;
    cost: number;
}

const DEFAULT_METRICS: CostMetrics = {
    spendYtd: 0,
    costPerHire: 0,
    avgFeePercent: 0,
};

/**
 * Derives cost metrics from placement and commission data.
 * Uses the commission-breakdown chart (scoped to company) to get total fees paid,
 * and placement-trends for monthly spend breakdown.
 */
export function useCostMetrics() {
    const { getToken } = useAuth();
    const [metrics, setMetrics] = useState<CostMetrics>(DEFAULT_METRICS);
    const [monthlySpend, setMonthlySpend] = useState<MonthlySpend[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            const now = new Date();
            const ytdStart = new Date(now.getFullYear(), 0, 1);

            const [commissionRes, statsRes, trendRes] = await Promise.all([
                api.get('/charts/commission-breakdown', {
                    params: {
                        scope: 'company',
                        start_date: ytdStart.toISOString().split('T')[0],
                        end_date: now.toISOString().split('T')[0],
                    },
                }) as Promise<any>,
                api.get('/stats', {
                    params: { scope: 'company', range: 'ytd' },
                }) as Promise<any>,
                api.get('/charts/placement-trends', {
                    params: {
                        scope: 'company',
                        start_date: ytdStart.toISOString().split('T')[0],
                        end_date: now.toISOString().split('T')[0],
                    },
                }) as Promise<any>,
            ]);

            // Sum up all fees from commission breakdown
            const chartData = commissionRes?.data?.data || commissionRes?.data || null;
            let totalFees = 0;
            if (chartData?.datasets?.[0]?.data) {
                totalFees = (chartData.datasets[0].data as number[]).reduce(
                    (sum, val) => sum + (val || 0),
                    0,
                );
            }

            const statsData = statsRes?.data?.metrics || statsRes?.data || {};
            const hiresYtd = statsData.placements_this_year || 0;

            const avgFeePercent = hiresYtd > 0 && totalFees > 0
                ? Math.min((totalFees / hiresYtd / 100000) * 100, 30)
                : 0;

            setMetrics({
                spendYtd: totalFees,
                costPerHire: hiresYtd > 0 ? Math.round(totalFees / hiresYtd) : 0,
                avgFeePercent: Math.round(avgFeePercent * 10) / 10,
            });

            // Monthly spend from placement trends
            const trendData = trendRes?.data?.data || trendRes?.data || null;
            if (trendData?.labels && trendData?.datasets?.[0]?.data) {
                const labels = trendData.labels as string[];
                const counts = trendData.datasets[0].data as number[];
                const costPerHire = hiresYtd > 0 ? totalFees / hiresYtd : 0;

                setMonthlySpend(
                    labels.map((month, i) => ({
                        month,
                        cost: Math.round((counts[i] || 0) * costPerHire),
                    })),
                );
            }
        } catch (err) {
            console.error('[CostMetrics] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { metrics, monthlySpend, loading, refresh };
}
