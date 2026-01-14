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
import { Chart } from 'react-chartjs-2';
import { TrendPeriodSelector, TIME_PERIODS } from './trend-period-selector';

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

interface Placement {
    id: string;
    created_at: string;
}

interface Application {
    id: string;
    stage: string;
    updated_at?: string;
    created_at: string;
}

interface MonthlyPlacementsChartProps {
    placements: Placement[];
    applications: Application[];
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

export default function MonthlyPlacementsChart({
    placements,
    applications,
    loading,
    trendPeriod,
    onTrendPeriodChange,
}: MonthlyPlacementsChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate trend data from placements and applications
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        // Initialize arrays for each month
        const placementCounts = new Array(months).fill(0);
        const offerCounts = new Array(months).fill(0);

        // Count placements per month
        placements.forEach((placement) => {
            const createdDate = new Date(placement.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                placementCounts[index]++;
            }
        });

        // Count applications in "offer" stage per month (by when they reached offer stage)
        applications.forEach((app) => {
            if (app.stage === 'offer') {
                // Use updated_at if available, otherwise created_at
                const dateToUse = app.updated_at || app.created_at;
                const date = new Date(dateToUse);
                const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 +
                    (now.getMonth() - date.getMonth());

                if (monthDiff >= 0 && monthDiff < months) {
                    const index = months - 1 - monthDiff;
                    offerCounts[index]++;
                }
            }
        });

        return {
            labels,
            placementCounts,
            offerCounts,
        };
    }, [placements, applications, trendPeriod]);

    // Calculate percentage changes for legend
    const changes = useMemo(() => {
        const { placementCounts, offerCounts } = trendData;
        const len = placementCounts.length;

        return {
            placements: calcPercentChange(placementCounts[len - 1] || 0, placementCounts[len - 2] || 0),
            offers: calcPercentChange(offerCounts[len - 1] || 0, offerCounts[len - 2] || 0),
        };
    }, [trendData]);

    // Chart data configuration - Mixed chart with bars and line
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                type: 'bar' as const,
                label: 'Placements',
                data: trendData.placementCounts,
                backgroundColor: dataset.successBackgroundColor,
                borderColor: dataset.successBorderColor,
                borderWidth: 2,
                borderRadius: 4,
                order: 2,
            },
            {
                type: 'line' as const,
                label: 'Offers',
                data: trendData.offerCounts,
                borderColor: dataset.warningBorderColor,
                backgroundColor: dataset.warningBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.warningBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
                order: 1,
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
                        size: 11,
                        family: 'system-ui, -apple-system, sans-serif',
                    },
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset: any, i: number) => {
                            const change = i === 0 ? changes.placements : changes.offers;
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
    }), [changes]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <span className="loading loading-spinner loading-md text-success"></span>
            </div>
        );
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
            <div className="h-24">
                <Chart ref={chartRef} type="bar" data={chartData} options={options} />
            </div>
        </div>
    );
}
