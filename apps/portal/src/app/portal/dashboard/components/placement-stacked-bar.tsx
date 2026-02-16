'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { ACCENT } from './accent';

interface PlacementStackedBarProps {
    trendPeriod?: number;
    refreshKey?: number;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
    }[];
}

// Memphis accent colors for chart bars
const BAR_CLASSES = ['bg-coral', 'bg-teal', 'bg-yellow', 'bg-purple'];

export default function PlacementStackedBar({ trendPeriod = 6, refreshKey }: PlacementStackedBarProps) {
    const { getToken } = useAuth();
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trendPeriod, refreshKey]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const now = new Date();
            const start = new Date(now);
            start.setMonth(start.getMonth() - trendPeriod);

            const response: any = await api.get('/charts/placement-stacked', {
                params: {
                    scope: 'recruiter',
                    start_date: start.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                },
            });

            const data = response?.data?.data || response?.data || null;
            if (data?.labels && data?.datasets) {
                setChartData(data);
            }
        } catch (err) {
            console.error('[PlacementStackedBar] Failed to load:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-36 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dark/20 border-t-coral animate-spin" />
            </div>
        );
    }

    if (!chartData || !chartData.datasets?.length) {
        return (
            <div className="h-36 flex items-center justify-center text-dark/30">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-chart-bar text-xl mb-1" />
                    <p className="text-[10px] font-black uppercase tracking-wider">No data</p>
                </div>
            </div>
        );
    }

    // Compute max stacked height for scaling
    const stackedTotals = chartData.labels.map((_, colIdx) =>
        chartData.datasets.reduce((sum, ds) => sum + (ds.data[colIdx] || 0), 0)
    );
    const maxStacked = Math.max(...stackedTotals, 1);

    return (
        <div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-3">
                {chartData.datasets.map((ds, i) => (
                    <div key={ds.label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 border-4 border-dark ${BAR_CLASSES[i % BAR_CLASSES.length]}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-dark/50">
                            {ds.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* CSS Stacked bar chart */}
            <div className="flex items-end gap-1 h-28">
                {chartData.labels.map((label, colIdx) => {
                    const colTotal = stackedTotals[colIdx];
                    const heightPct = maxStacked > 0 ? (colTotal / maxStacked) * 100 : 0;

                    return (
                        <div key={label} className="flex-1 flex flex-col items-stretch" title={`${label}: ${colTotal}`}>
                            {/* Stacked segments */}
                            <div
                                className="flex flex-col-reverse border-4 border-dark overflow-hidden transition-all duration-500"
                                style={{ height: `${Math.max(heightPct, 5)}%` }}
                            >
                                {chartData.datasets.map((ds, dsIdx) => {
                                    const val = ds.data[colIdx] || 0;
                                    const segPct = colTotal > 0 ? (val / colTotal) * 100 : 0;
                                    if (segPct === 0) return null;
                                    return (
                                        <div
                                            key={ds.label}
                                            className={`${BAR_CLASSES[dsIdx % BAR_CLASSES.length]}`}
                                            style={{ height: `${segPct}%` }}
                                        />
                                    );
                                })}
                            </div>
                            {/* Label */}
                            <div className="text-[8px] font-bold text-dark/30 text-center mt-1 uppercase truncate">
                                {label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}