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
import { TrendPeriodSelector, TIME_PERIODS } from './trend-period-selector';

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
    created_at: string;
}

interface Job {
    id: string;
    created_at: string;
    status: string;
}

interface CompanyTrendsChartProps {
    applications: Application[];
    jobs: Job[];
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

// Export function to calculate stat trends - used by parent component
export function calculateCompanyTrends(applications: Application[], jobs: Job[], months: number): {
    applications: number;
    activeRoles: number;
} {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (months * 2), 1);

    // Current period counts
    const currentApplications = applications.filter(app => new Date(app.created_at) >= periodStart).length;
    const currentActiveRoles = jobs.filter(job =>
        new Date(job.created_at) >= periodStart && job.status === 'active'
    ).length;

    // Previous period counts
    const previousApplications = applications.filter(app => {
        const date = new Date(app.created_at);
        return date >= previousPeriodStart && date < periodStart;
    }).length;
    const previousActiveRoles = jobs.filter(job => {
        const date = new Date(job.created_at);
        return date >= previousPeriodStart && date < periodStart && job.status === 'active';
    }).length;

    return {
        applications: calcPercentChangeNumber(currentApplications, previousApplications),
        activeRoles: calcPercentChangeNumber(currentActiveRoles, previousActiveRoles),
    };
}

export default function CompanyTrendsChart({
    applications,
    jobs,
    loading,
    trendPeriod,
    onTrendPeriodChange,
}: CompanyTrendsChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate trend data from applications and jobs
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        // Initialize arrays for each month
        const totalApplications = new Array(months).fill(0);
        const activeRoles = new Array(months).fill(0);
        const newRoles = new Array(months).fill(0);

        // Count applications created in each month
        applications.forEach((app) => {
            const createdDate = new Date(app.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                totalApplications[index]++;
            }
        });

        // Count roles in each month
        jobs.forEach((job) => {
            const createdDate = new Date(job.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;

                // Count new roles created in this month
                newRoles[index]++;

                // Count active roles in this month (cumulative up to this point)
                if (job.status === 'active') {
                    // For active roles, count them in all months from creation to present
                    for (let i = index; i < months; i++) {
                        activeRoles[i]++;
                    }
                }
            }
        });

        return {
            labels,
            totalApplications,
            activeRoles,
            newRoles,
        };
    }, [applications, jobs, trendPeriod]);

    // Calculate percentage changes for legend
    const changes = useMemo(() => {
        const { totalApplications, activeRoles, newRoles } = trendData;
        const len = totalApplications.length;

        return {
            applications: calcPercentChange(totalApplications[len - 1] || 0, totalApplications[len - 2] || 0),
            activeRoles: calcPercentChange(activeRoles[len - 1] || 0, activeRoles[len - 2] || 0),
            newRoles: calcPercentChange(newRoles[len - 1] || 0, newRoles[len - 2] || 0),
        };
    }, [trendData]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                label: 'Applications',
                data: trendData.totalApplications,
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
                label: 'Active Roles',
                data: trendData.activeRoles,
                borderColor: dataset.secondaryBorderColor,
                backgroundColor: dataset.secondaryBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.secondaryBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
            },
            {
                label: 'New Roles',
                data: trendData.newRoles,
                borderColor: dataset.accentBorderColor,
                backgroundColor: dataset.accentBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.accentBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
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
                    padding: 16,
                    font: {
                        size: 12,
                        family: 'system-ui, -apple-system, sans-serif',
                    },
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset: any, i: number) => {
                            const change = i === 0 ? changes.applications :
                                i === 1 ? changes.activeRoles :
                                    changes.newRoles;
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
                padding: 12,
                cornerRadius: 8,
                titleColor: '#fff',
                bodyColor: '#fff',
                titleFont: {
                    size: 13,
                    weight: 'bold' as const,
                },
                bodyFont: {
                    size: 12,
                },
                displayColors: true,
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
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
                        size: 11,
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
                        size: 11,
                    },
                    callback: (value: any) => {
                        return Number(value).toFixed(0);
                    },
                },
            },
        },
    }), [changes]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
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
            <div className="h-64">
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
}
