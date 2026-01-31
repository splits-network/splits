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

interface Application {
    id: string;
    stage: string;
    created_at: string;
}

interface ApplicationTimelineChartProps {
    applications: Application[];
    loading?: boolean;
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

// Time period options
export const TIME_PERIODS = [
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

export default function ApplicationTimelineChart({
    applications,
    loading,
    trendPeriod,
    onTrendPeriodChange,
}: ApplicationTimelineChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate trend data from applications
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        // Initialize arrays for each month
        const totalApps = new Array(months).fill(0);
        const interviewingApps = new Array(months).fill(0);
        const offerApps = new Array(months).fill(0);

        applications.forEach((app) => {
            const createdDate = new Date(app.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            // Count applications created in each month
            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                totalApps[index]++;

                if (app.stage === 'interviewing' || app.stage === 'final_interview') {
                    interviewingApps[index]++;
                }
                if (app.stage === 'offer') {
                    offerApps[index]++;
                }
            }
        });

        return {
            labels,
            totalApps,
            interviewingApps,
            offerApps,
        };
    }, [applications, trendPeriod]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                label: 'Total',
                data: trendData.totalApps,
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
                label: 'Interviewing',
                data: trendData.interviewingApps,
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
            {
                label: 'Offers',
                data: trendData.offerApps,
                borderColor: dataset.warningBorderColor,
                backgroundColor: dataset.warningBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.warningBorderColor,
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

    // Empty state
    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-base-content/60">
                <i className="fa-duotone fa-regular fa-chart-line text-2xl mb-2"></i>
                <p className="text-sm">No application data yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header with custom legend */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <h3 className="text-sm font-medium text-base-content/80">Application Trends</h3>
                </div>
                {/* Time period dropdown */}
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="text-xs text-base-content/50 hover:text-base-content cursor-pointer flex items-center gap-1 transition-colors"
                    >
                        {TIME_PERIODS.find(p => p.value === trendPeriod)?.label || '6M'}
                        <i className="fa-duotone fa-regular fa-chevron-down text-[10px]"></i>
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-20 p-1 shadow-lg border border-base-300 mt-1">
                        {TIME_PERIODS.map((period) => (
                            <li key={period.value}>
                                <button
                                    className={`text-xs justify-center ${trendPeriod === period.value ? 'active' : ''}`}
                                    onClick={() => onTrendPeriodChange(period.value)}
                                >
                                    {period.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.primaryBorderColor }}></span>
                    <span className="text-base-content/70">Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <span className="text-base-content/70">Interviewing</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.warningBorderColor }}></span>
                    <span className="text-base-content/70">Offers</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-32">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
