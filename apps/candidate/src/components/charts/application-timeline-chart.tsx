'use client';

import { useMemo, useRef, useEffect } from 'react';
import { ChartLoadingState } from '@splits-network/shared-ui';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

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
    compact?: boolean;
}

export const TIME_PERIODS = [
    { value: 3, label: '3M' },
    { value: 6, label: '6M' },
    { value: 12, label: '1Y' },
    { value: 24, label: '2Y' },
] as const;

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
    compact,
}: ApplicationTimelineChartProps) {
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        const totalApps = new Array(months).fill(0);
        const interviewingApps = new Array(months).fill(0);
        const offerApps = new Array(months).fill(0);

        applications.forEach((app) => {
            const createdDate = new Date(app.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                totalApps[index]++;

                if (app.stage === 'interview' || app.stage === 'final_interview') {
                    interviewingApps[index]++;
                }
                if (app.stage === 'offer') {
                    offerApps[index]++;
                }
            }
        });

        return { labels, totalApps, interviewingApps, offerApps };
    }, [applications, trendPeriod]);

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
                pointHoverRadius: 5,
                pointHoverBackgroundColor: dataset.primaryBorderColor,
                pointHoverBorderColor: dataset.base100BorderColor,
                pointHoverBorderWidth: 2,
                fill: true,
            },
            {
                label: 'Interviewing',
                data: trendData.interviewingApps,
                borderColor: dataset.infoBorderColor,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: dataset.infoBorderColor,
                pointHoverBorderColor: dataset.base100BorderColor,
                pointHoverBorderWidth: 2,
                borderDash: [4, 2],
                fill: false,
            },
            {
                label: 'Offers',
                data: trendData.offerApps,
                borderColor: dataset.warningBorderColor,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: dataset.warningBorderColor,
                pointHoverBorderColor: dataset.base100BorderColor,
                pointHoverBorderWidth: 2,
                borderDash: [4, 2],
                fill: false,
            },
        ],
    }), [trendData]);

    // Limit x-axis labels in compact mode to prevent overflow
    const maxTicksLimit = compact
        ? (trendPeriod <= 6 ? trendPeriod : Math.min(6, Math.ceil(trendPeriod / 3)))
        : undefined;

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        layout: {
            padding: { top: 4, bottom: 0, left: 0, right: 0 },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: dataset.base100BorderColor,
                titleColor: dataset.baseContentBorderColor,
                bodyColor: dataset.baseContentBorderColor,
                borderColor: dataset.base300BorderColor,
                borderWidth: 1,
                padding: 10,
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
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: dataset.baseContentBorderColor,
                    font: { size: 10 },
                    maxTicksLimit,
                    maxRotation: 0,
                },
            },
            y: {
                grid: { display: false },
                border: { display: false },
                ticks: { display: false },
                beginAtZero: true,
            },
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [maxTicksLimit]);

    if (loading) {
        return <ChartLoadingState height={compact ? 200 : 240} />;
    }

    if (applications.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center ${compact ? 'h-[200px]' : 'h-60'} text-base-content/60`}>
                <i className="fa-duotone fa-regular fa-chart-line text-2xl mb-2"></i>
                <p className="text-sm">No trend data yet</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-2">
                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.primaryBorderColor }}></span>
                        <span className="text-base-content/60">Total</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                        <span className="text-base-content/60">Interviewing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.warningBorderColor }}></span>
                        <span className="text-base-content/60">Offers</span>
                    </div>
                </div>

                {/* Chart — sized to match sibling cards */}
                <div className="h-[180px]">
                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-base-content/80">Application Trends</h3>
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

            <div className="h-[200px]">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
