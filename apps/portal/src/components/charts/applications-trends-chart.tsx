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
import { dataset, registerChart } from '../charts/chart-options';
import { Line } from 'react-chartjs-2';
import type { ApplicationStage } from '@splits-network/shared-types';

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
    stage: ApplicationStage;
    created_at: string;
    accepted_by_company: boolean;
}

interface ApplicationsTrendsChartProps {
    applications: Application[];
    loading?: boolean;
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

// Time period options - exported for use by parent
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

// Calculate percentage change as number
function calcPercentChangeNumber(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// Calculate percentage change as string (for internal use)
function calcPercentChange(current: number, previous: number): string {
    const change = calcPercentChangeNumber(current, previous);
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
}

// Export function to calculate stat trends - used by parent component
export function calculateApplicationTrends(applications: Application[], months: number): {
    total: number;
    pending: number;
    accepted: number;
    offer: number;
} {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (months * 2), 1);

    // Current period counts
    const currentPeriodApps = applications.filter(app => new Date(app.created_at) >= periodStart);
    const currentTotal = currentPeriodApps.length;
    const currentPending = currentPeriodApps.filter(a => a.stage === 'submitted' || a.stage === 'screen').length;
    const currentAccepted = currentPeriodApps.filter(a => a.accepted_by_company).length;
    const currentOffer = currentPeriodApps.filter(a => a.stage === 'offer').length;

    // Previous period counts
    const previousPeriodApps = applications.filter(app => {
        const date = new Date(app.created_at);
        return date >= previousPeriodStart && date < periodStart;
    });
    const previousTotal = previousPeriodApps.length;
    const previousPending = previousPeriodApps.filter(a => a.stage === 'submitted' || a.stage === 'screen').length;
    const previousAccepted = previousPeriodApps.filter(a => a.accepted_by_company).length;
    const previousOffer = previousPeriodApps.filter(a => a.stage === 'offer').length;

    return {
        total: calcPercentChangeNumber(currentTotal, previousTotal),
        pending: calcPercentChangeNumber(currentPending, previousPending),
        accepted: calcPercentChangeNumber(currentAccepted, previousAccepted),
        offer: calcPercentChangeNumber(currentOffer, previousOffer),
    };
}

export default function ApplicationsTrendsChart({
    applications,
    loading,
    trendPeriod,
    onTrendPeriodChange,
}: ApplicationsTrendsChartProps) {
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
        const pendingApps = new Array(months).fill(0);
        const acceptedApps = new Array(months).fill(0);
        const offerApps = new Array(months).fill(0);

        applications.forEach((app) => {
            const createdDate = new Date(app.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            // Count applications created in each month
            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                totalApps[index]++;

                if (app.stage === 'submitted' || app.stage === 'screen') {
                    pendingApps[index]++;
                }
                if (app.accepted_by_company) {
                    acceptedApps[index]++;
                }
                if (app.stage === 'offer') {
                    offerApps[index]++;
                }
            }
        });

        return {
            labels,
            totalApps,
            pendingApps,
            acceptedApps,
            offerApps,
        };
    }, [applications, trendPeriod]);

    // Calculate percentage changes for legend
    const changes = useMemo(() => {
        const { totalApps, pendingApps, acceptedApps, offerApps } = trendData;
        const len = totalApps.length;

        return {
            total: calcPercentChange(totalApps[len - 1] || 0, totalApps[len - 2] || 0),
            pending: calcPercentChange(pendingApps[len - 1] || 0, pendingApps[len - 2] || 0),
            accepted: calcPercentChange(acceptedApps[len - 1] || 0, acceptedApps[len - 2] || 0),
            offer: calcPercentChange(offerApps[len - 1] || 0, offerApps[len - 2] || 0),
        };
    }, [trendData]);

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
                label: 'Pending Review',
                data: trendData.pendingApps,
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
            {
                label: 'Accepted',
                data: trendData.acceptedApps,
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
                label: 'Offers',
                data: trendData.offerApps,
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
                display: false, // We'll use custom legend
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
                <p className="text-sm">No trend data yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header with custom legend */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <h3 className="text-sm font-medium text-base-content/80">Trends</h3>
                    <span className="text-base-content/30">•••</span>
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
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.warningBorderColor }}></span>
                    <span className="text-base-content/70">Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.successBorderColor }}></span>
                    <span className="text-base-content/70">Accepted</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <span className="text-base-content/70">Offers</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-32">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>

            {/* Stats row with changes */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-base-300">
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: dataset.primaryBorderColor }}></span>
                    <span className="text-base-content/70">Total</span>
                    <span className={`font-medium ${changes.total.startsWith('+') ? 'text-success' : changes.total.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.total}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: dataset.warningBorderColor }}></span>
                    <span className="text-base-content/70">Pending</span>
                    <span className={`font-medium ${changes.pending.startsWith('+') ? 'text-success' : changes.pending.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.pending}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: dataset.successBorderColor }}></span>
                    <span className="text-base-content/70">Accepted</span>
                    <span className={`font-medium ${changes.accepted.startsWith('+') ? 'text-success' : changes.accepted.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.accepted}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <span className="text-base-content/70">Offers</span>
                    <span className={`font-medium ${changes.offer.startsWith('+') ? 'text-success' : changes.offer.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.offer}
                    </span>
                </div>
            </div>
        </div>
    );
}
