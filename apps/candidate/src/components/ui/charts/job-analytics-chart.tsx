'use client';

import { useMemo, useRef, useEffect } from 'react';
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
import { dataset, registerChart } from './chart-options';
import { Line } from 'react-chartjs-2';

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

interface JobAnalyticsChartProps {
    jobId: string;
    loading?: boolean;
}

// Time period options
const TIME_PERIODS = [
    { value: 3, label: '3M' },
    { value: 6, label: '6M' },
    { value: 12, label: '1Y' },
    { value: 24, label: '2Y' },
] as const;

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
    views: number[];
    applications: number[];
    interviews: number[];
} {
    const views = [];
    const applications = [];
    const interviews = [];

    // Base values with realistic patterns
    const baseViews = 45;
    const baseApplications = 12;
    const baseInterviews = 5;

    for (let i = 0; i < months; i++) {
        // Add some randomness and growth trend
        const trend = i / months; // 0 to 1
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

        views.push(Math.round(baseViews * (1 + trend * 0.3) * randomFactor));
        applications.push(Math.round(baseApplications * (1 + trend * 0.2) * randomFactor));
        interviews.push(Math.round(baseInterviews * (1 + trend * 0.15) * randomFactor));
    }

    return { views, applications, interviews };
}

export function JobAnalyticsChart({ jobId, loading }: JobAnalyticsChartProps) {
    const chartRef = useRef<any>(null);
    const [trendPeriod, setTrendPeriod] = useMemo(() => [6, (p: number) => { }], []); // Default to 6 months

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
                label: 'Job Views',
                data: trendData.views,
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
                label: 'Applications',
                data: trendData.applications,
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
                label: 'Interviews',
                data: trendData.interviews,
                borderColor: dataset.infoBorderColor,
                backgroundColor: dataset.infoBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.infoBorderColor,
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
        return (
            <div className="flex items-center justify-center h-40">
                <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
        );
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
                    <h3 className="text-sm font-medium text-base-content/80">Job Performance Trends</h3>
                </div>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.primaryBorderColor }}></span>
                    <span className="text-base-content/70">Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.successBorderColor }}></span>
                    <span className="text-base-content/70">Applications</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <span className="text-base-content/70">Interviews</span>
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
                    Sample data shown - Real-time analytics will track job views, applications, and interview activity
                </p>
            </div>
        </div>
    );
}
