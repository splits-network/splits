'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { dataset, registerChart } from '../charts/chart-options';
import { Line } from 'react-chartjs-2';
import { ChartLoadingState } from '@splits-network/shared-ui';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

interface InvitationsTrendsChartProps {
    loading?: boolean;
}

// Generate last N months labels
function getLastNMonths(n: number): string[] {
    const months = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase());
    }
    return months;
}

// Generate realistic mock data with slight variations
function generateMockData(months: number): {
    sent: number[];
    accepted: number[];
    declined: number[];
} {
    const sent = [];
    const accepted = [];
    const declined = [];

    // Base values with realistic patterns
    const baseSent = 15;
    const baseAccepted = 10;
    const baseDeclined = 3;

    for (let i = 0; i < months; i++) {
        // Add some randomness and growth trend
        const trend = i / months; // 0 to 1
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

        const sentCount = Math.round(baseSent * (1 + trend * 0.3) * randomFactor);
        sent.push(sentCount);

        // Accepted is typically 60-70% of sent
        accepted.push(Math.round(sentCount * (0.6 + Math.random() * 0.1)));

        // Declined is typically 15-25% of sent
        declined.push(Math.round(sentCount * (0.15 + Math.random() * 0.1)));
    }

    return { sent, accepted, declined };
}

export function InvitationsTrendsChart({ loading }: InvitationsTrendsChartProps) {
    const chartRef = useRef<any>(null);
    const trendPeriod = 6; // 6 months
    const [mounted, setMounted] = useState(false);

    // Only render colors after client-side mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate mock trend data
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const mockData = generateMockData(months);

        return {
            labels,
            ...mockData,
        };
    }, [trendPeriod]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                label: 'Invitations Sent',
                data: trendData.sent,
                borderColor: dataset.primaryBorderColor,
                backgroundColor: dataset.primaryBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.primaryBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
            },
            {
                label: 'Accepted',
                data: trendData.accepted,
                borderColor: dataset.successBorderColor,
                backgroundColor: dataset.successBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.successBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
            },
            {
                label: 'Declined',
                data: trendData.declined,
                borderColor: dataset.errorBorderColor,
                backgroundColor: dataset.errorBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.errorBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
            },
        ],
    }), [trendData]);

    // Chart options - minimal clean style
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    title: function (context: { label?: string }[]) {
                        return context[0]?.label || '';
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: dataset.baseContentBorderColor,
                    font: {
                        size: 11,
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    display: false,
                },
                beginAtZero: true,
            },
        },
    }), []);

    // Loading state
    if (loading) {
        return <ChartLoadingState height="10rem" />;
    }

    return (
        <div className="space-y-3 relative">
            {/* Coming Soon Badge Overlay */}
            <div className="absolute top-2 right-2 z-10">
                <div className="badge badge-warning badge-lg gap-2 shadow-lg">
                    <i className="fa-duotone fa-regular fa-clock"></i>
                    Analytics Coming Soon
                </div>
            </div>

            {/* Header with custom legend */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-chart-line text-base-content/70"></i>
                    <h3 className="text-sm font-medium text-base-content/80">Invitation Activity Trends</h3>
                </div>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    {mounted && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.primaryBorderColor }}></span>}
                    <span className="text-base-content/70">Sent</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {mounted && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.successBorderColor }}></span>}
                    <span className="text-base-content/70">Accepted</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {mounted && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.errorBorderColor }}></span>}
                    <span className="text-base-content/70">Declined</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-32 opacity-60">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>

            {/* Info Message */}
            <div className="pt-2 border-t border-base-300">
                <p className="text-xs text-base-content/60 text-center">
                    <i className="fa-duotone fa-regular fa-circle-info mr-1"></i>
                    Sample data shown - Real-time analytics will track invitation activity and response rates
                </p>
            </div>
        </div>
    );
}
