import { useMemo, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { dataset, registerChart } from './chart-options';
import { Bar } from 'react-chartjs-2';
import { TrendPeriodSelector, TIME_PERIODS } from './trend-period-selector';
import { ChartLoadingState } from '@splits-network/shared-ui';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Filler
);

interface Application {
    id: string;
    created_at: string;
    recruiter_id?: string;
}

interface Placement {
    id: string;
    created_at: string;
    recruiter_id?: string;
}

interface RecruiterActivityChartProps {
    applications: Application[];
    placements: Placement[];
    loading?: boolean;
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
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

// Calculate percentage change as number
function calcPercentChangeNumber(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// Calculate percentage change as string
function calcPercentChange(current: number, previous: number): string {
    const change = calcPercentChangeNumber(current, previous);
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
}

export default function RecruiterActivityChart({
    applications,
    placements,
    loading,
    trendPeriod,
    onTrendPeriodChange,
}: RecruiterActivityChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate trend data from applications and placements
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        // Initialize arrays for each month
        const activeRecruiters = new Array(months).fill(0);
        const totalSubmissions = new Array(months).fill(0);
        const recruitersWithPlacements = new Array(months).fill(0);

        // Track unique recruiters per month
        const recruitersByMonth: Set<string>[] = Array.from({ length: months }, () => new Set());
        const recruitersWithPlacementsByMonth: Set<string>[] = Array.from({ length: months }, () => new Set());

        // Count applications (submissions) and unique recruiters per month
        applications.forEach((app) => {
            const createdDate = new Date(app.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months && app.recruiter_id) {
                const index = months - 1 - monthDiff;
                totalSubmissions[index]++;
                recruitersByMonth[index].add(app.recruiter_id);
            }
        });

        // Count unique recruiters with placements per month
        placements.forEach((placement) => {
            const createdDate = new Date(placement.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months && placement.recruiter_id) {
                const index = months - 1 - monthDiff;
                recruitersWithPlacementsByMonth[index].add(placement.recruiter_id);
            }
        });

        // Convert sets to counts
        for (let i = 0; i < months; i++) {
            activeRecruiters[i] = recruitersByMonth[i].size;
            recruitersWithPlacements[i] = recruitersWithPlacementsByMonth[i].size;
        }

        return {
            labels,
            activeRecruiters,
            totalSubmissions,
            recruitersWithPlacements,
        };
    }, [applications, placements, trendPeriod]);

    // Calculate percentage changes for legend
    const changes = useMemo(() => {
        const { activeRecruiters, totalSubmissions, recruitersWithPlacements } = trendData;
        const len = activeRecruiters.length;

        return {
            activeRecruiters: calcPercentChange(activeRecruiters[len - 1] || 0, activeRecruiters[len - 2] || 0),
            totalSubmissions: calcPercentChange(totalSubmissions[len - 1] || 0, totalSubmissions[len - 2] || 0),
            recruitersWithPlacements: calcPercentChange(recruitersWithPlacements[len - 1] || 0, recruitersWithPlacements[len - 2] || 0),
        };
    }, [trendData]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                label: 'Active Recruiters',
                data: trendData.activeRecruiters,
                backgroundColor: dataset.primaryBackgroundColor,
                borderColor: dataset.primaryBorderColor,
                borderWidth: 2,
                borderRadius: 4,
            },
            {
                label: 'With Placements',
                data: trendData.recruitersWithPlacements,
                backgroundColor: dataset.successBackgroundColor,
                borderColor: dataset.successBorderColor,
                borderWidth: 2,
                borderRadius: 4,
            },
        ],
    }), [trendData]);

    // Chart options
    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    padding: 12,
                    font: {
                        size: 10,
                        family: 'system-ui, -apple-system, sans-serif',
                    },
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset: any, i: number) => {
                            const change = i === 0 ? changes.activeRecruiters : changes.recruitersWithPlacements;
                            return {
                                text: `${dataset.label} ${change}`,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 2,
                                hidden: !chart.isDatasetVisible(i),
                                datasetIndex: i,
                            };
                        });
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 10,
                cornerRadius: 6,
                titleColor: '#fff',
                bodyColor: '#fff',
                titleFont: {
                    size: 12,
                    weight: 'bold' as const,
                },
                bodyFont: {
                    size: 11,
                },
                displayColors: true,
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        const monthIndex = context.dataIndex;

                        if (label === 'Active Recruiters') {
                            const submissions = trendData.totalSubmissions[monthIndex];
                            return `${label}: ${value} (${submissions} submission${submissions !== 1 ? 's' : ''})`;
                        }

                        return `${label}: ${value}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                    callback: (value: any) => {
                        return Number(value).toFixed(0);
                    },
                },
            },
        },
    }), [changes, trendData]);

    if (loading) {
        return <ChartLoadingState height="12rem" />;
    }

    return (
        <div className="space-y-3">
            {/* Header with title and time period selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <h3 className="text-sm font-medium text-base-content/80">Trends</h3>
                    <span className="text-base-content/30">•••</span>
                </div>
                <TrendPeriodSelector
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={onTrendPeriodChange}
                />
            </div>

            {/* Chart */}
            <div className="h-24 bg-amber-600">
                <Bar ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
}
