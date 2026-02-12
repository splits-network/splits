'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartLoadingState } from '@splits-network/shared-ui';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PlacementStackedBarProps {
    trendPeriod?: number;
    refreshKey?: number;
    height?: number;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
    }[];
}

export default function PlacementStackedBar({
    trendPeriod = 6,
    refreshKey,
    height = 140,
}: PlacementStackedBarProps) {
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
        return <ChartLoadingState height={height} />;
    }

    if (!chartData || !chartData.datasets?.length) {
        return (
            <div style={{ height }} className="flex items-center justify-center text-base-content/50">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-chart-bar fa-2x mb-1 opacity-20"></i>
                    <p className="text-xs">No placement data</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height }}>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                padding: 8,
                                font: { size: 10 },
                            },
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: { font: { size: 9 } },
                            grid: { display: false },
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: { precision: 0, font: { size: 9 } },
                            grid: { color: 'rgba(128,128,128,0.1)' },
                        },
                    },
                }}
            />
        </div>
    );
}
