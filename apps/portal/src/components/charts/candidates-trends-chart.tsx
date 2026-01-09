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

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    verification_status?: string;
    has_active_relationship?: boolean;
    created_at: string;
}

interface CandidatesTrendsChartProps {
    candidates: Candidate[];
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
export function calculateCandidateStatTrends(candidates: Candidate[], months: number): {
    total: number;
    verified: number;
    withRelationships: number;
} {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (months * 2), 1);

    // Current period counts
    const currentPeriodCandidates = candidates.filter(candidate => new Date(candidate.created_at) >= periodStart);
    const currentTotal = currentPeriodCandidates.length;
    const currentVerified = currentPeriodCandidates.filter(c => c.verification_status === 'verified').length;
    const currentWithRelationships = currentPeriodCandidates.filter(c => c.has_active_relationship).length;

    // Previous period counts
    const previousPeriodCandidates = candidates.filter(candidate => {
        const date = new Date(candidate.created_at);
        return date >= previousPeriodStart && date < periodStart;
    });
    const previousTotal = previousPeriodCandidates.length;
    const previousVerified = previousPeriodCandidates.filter(c => c.verification_status === 'verified').length;
    const previousWithRelationships = previousPeriodCandidates.filter(c => c.has_active_relationship).length;

    return {
        total: calcPercentChangeNumber(currentTotal, previousTotal),
        verified: calcPercentChangeNumber(currentVerified, previousVerified),
        withRelationships: calcPercentChangeNumber(currentWithRelationships, previousWithRelationships),
    };
}

export function CandidatesTrendsChart({ candidates, loading, trendPeriod, onTrendPeriodChange }: CandidatesTrendsChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Generate trend data from candidates
    const trendData = useMemo(() => {
        const months = trendPeriod;
        const labels = getLastNMonths(months);
        const now = new Date();

        // Initialize arrays for each month
        const candidatesAdded = new Array(months).fill(0);
        const verifiedCandidates = new Array(months).fill(0);
        const withActivRelationships = new Array(months).fill(0);

        candidates.forEach((candidate) => {
            const createdDate = new Date(candidate.created_at);
            const monthDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 +
                (now.getMonth() - createdDate.getMonth());

            // Count candidates added in each month
            if (monthDiff >= 0 && monthDiff < months) {
                const index = months - 1 - monthDiff;
                candidatesAdded[index]++;
            }

            // Count cumulative verified/with relationships per month
            for (let i = 0; i < months; i++) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
                if (createdDate <= monthDate) {
                    if (candidate.verification_status === 'verified') {
                        verifiedCandidates[i]++;
                    }
                    if (candidate.has_active_relationship) {
                        withActivRelationships[i]++;
                    }
                }
            }
        });

        return {
            labels,
            candidatesAdded,
            verifiedCandidates,
            withActivRelationships,
        };
    }, [candidates, trendPeriod]);

    // Calculate percentage changes for legend
    const changes = useMemo(() => {
        const { candidatesAdded, verifiedCandidates, withActivRelationships } = trendData;
        const len = candidatesAdded.length;

        return {
            added: calcPercentChange(candidatesAdded[len - 1] || 0, candidatesAdded[len - 2] || 0),
            verified: calcPercentChange(verifiedCandidates[len - 1] || 0, verifiedCandidates[len - 2] || 0),
            withRelationships: calcPercentChange(withActivRelationships[len - 1] || 0, withActivRelationships[len - 2] || 0),
        };
    }, [trendData]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: trendData.labels,
        datasets: [
            {
                label: 'New Candidates',
                data: trendData.candidatesAdded,
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
                label: 'Verified',
                data: trendData.verifiedCandidates,
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
                label: 'With Active Relationships',
                data: trendData.withActivRelationships,
                borderColor: dataset.neutralBorderColor,
                backgroundColor: dataset.neutralBackgroundColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: dataset.neutralBorderColor,
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
    if (candidates.length === 0) {
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

            {/* Custom Legend with percentage changes */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.primaryBorderColor }}></span>
                    <span className="text-base-content/70">New Candidates</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <span className="text-base-content/70">Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dataset.neutralBorderColor }}></span>
                    <span className="text-base-content/70">With Active Relationships</span>
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
                    <span className="text-base-content/70">New</span>
                    <span className={`font-medium ${changes.added.startsWith('+') ? 'text-success' : changes.added.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.added}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <span className="text-base-content/70">Verified</span>
                    <span className={`font-medium ${changes.verified.startsWith('+') ? 'text-success' : changes.verified.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.verified}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: dataset.neutralBorderColor }}></span>
                    <span className="text-base-content/70">With Relationships</span>
                    <span className={`font-medium ${changes.withRelationships.startsWith('+') ? 'text-success' : changes.withRelationships.startsWith('-') ? 'text-error' : 'text-base-content/50'}`}>
                        {changes.withRelationships}
                    </span>
                </div>
            </div>
        </div>
    );
}
