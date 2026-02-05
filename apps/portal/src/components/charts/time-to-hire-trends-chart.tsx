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

interface Placement {
    id: string;
    created_at: string;
    application_id: string;
    application?: {
        created_at: string;
    };
}

interface TimeToHireTrendsChartProps {
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

// Calculate days between two dates
function daysBetween(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function TimeToHireTrendsChart({
    placements,
    loading,
    trendPeriod,
    onTrendPeriodChange,
}: TimeToHireTrendsChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate trend data from placements
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        // Initialize arrays for each month
        const avgTimeToHire = new Array(months).fill(null);
        const placementCounts = new Array(months).fill(0);

        // Calculate average time to hire per month
        placements.forEach((placement) => {
            if (!placement.application?.created_at) return;

            const hiredDate = new Date(placement.created_at);
            const appliedDate = new Date(placement.application.created_at);
            const daysToHire = daysBetween(placement.application.created_at, placement.created_at);

            const monthDiff = (now.getFullYear() - hiredDate.getFullYear()) * 12 +
                (now.getMonth() - hiredDate.getMonth());

            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;

                // Accumulate for average calculation
                if (avgTimeToHire[index] === null) {
                    avgTimeToHire[index] = daysToHire;
                } else {
                    avgTimeToHire[index] = (avgTimeToHire[index] * placementCounts[index] + daysToHire) / (placementCounts[index] + 1);
                }
                placementCounts[index]++;
            }
        });

        // Create benchmark line (42 days industry average)
        const benchmarkLine = new Array(months).fill(42);

        return {
            labels,
            avgTimeToHire,
            benchmarkLine,
            placementCounts,
        };
    }, [placements, trendPeriod]);

    // Calculate percentage change for legend
    const changes = useMemo(() => {
        const { avgTimeToHire } = trendData;
        const len = avgTimeToHire.length;

        // Find the last two non-null values
        let current = null;
        let previous = null;

        for (let i = len - 1; i >= 0; i--) {
            if (avgTimeToHire[i] !== null) {
                if (current === null) {
                    current = avgTimeToHire[i];
                } else if (previous === null) {
                    previous = avgTimeToHire[i];
                    break;
                }
            }
        }

        return {
            timeToHire: current !== null && previous !== null
                ? calcPercentChange(current, previous)
                : '—',
        };
    }, [trendData]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                label: 'Avg Time to Hire',
                data: trendData.avgTimeToHire,
                borderColor: dataset.infoBorderColor,
                backgroundColor: dataset.infoBackgroundColor,
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: dataset.infoBorderColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: false,
                spanGaps: true, // Connect points even if there are null values
            },
            {
                label: 'Industry Benchmark',
                data: trendData.benchmarkLine,
                borderColor: dataset.baseContentBorderColor,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
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
                    padding: 12,
                    font: {
                        size: 11,
                        family: 'system-ui, -apple-system, sans-serif',
                    },
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset: any, i: number) => {
                            const change = i === 0 ? changes.timeToHire : '';
                            return {
                                text: `${dataset.label}${change ? ` ${change}` : ''}`,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: i === 1 ? 0 : 2, // Hide line for benchmark in legend
                                hidden: !chart.isDatasetVisible(i),
                                datasetIndex: i,
                                lineDash: i === 1 ? [5, 5] : undefined,
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

                        if (label === 'Industry Benchmark') {
                            return `${label}: ${value} days`;
                        }

                        if (value === null) {
                            return `${label}: No data`;
                        }

                        const count = trendData.placementCounts[context.dataIndex];
                        return `${label}: ${Math.round(value)} days (${count} hire${count !== 1 ? 's' : ''})`;
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
                        return `${value} days`;
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
            <div className="h-48">
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
}
