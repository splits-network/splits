'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { TrendPeriodSelector, TIME_PERIODS } from './trend-period-selector';
import { ChartLoadingState } from '@splits-network/shared-ui';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Tooltip,
    Legend,
    Filler
);

export type ChartType =
    | 'recruiter-activity'
    | 'application-trends'
    | 'placement-trends'
    | 'placement-stacked'
    | 'role-trends'
    | 'candidate-trends'
    | 'time-to-hire-trends'
    | 'submission-trends'
    | 'submission-heatmap'
    | 'earnings-trends'
    | 'time-to-place-trends'
    | 'commission-breakdown'
    | 'recruitment-funnel'
    | 'reputation-radar';

export interface AnalyticsChartProps {
    type: ChartType;
    startDate?: string;
    endDate?: string;
    scope?: string;
    scopeId?: string;
    title?: string;
    chartComponent?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
    height?: number;
    showPeriodSelector?: boolean;
    trendPeriod?: number;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    onTrendPeriodChange?: (period: number) => void;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
    }[];
}

/**
 * Generic analytics chart component that fetches data from analytics service
 * Supports all 6 chart types with customizable date ranges and scoping
 */
export function AnalyticsChart({
    type,
    startDate,
    endDate,
    scope,
    scopeId,
    title,
    chartComponent = 'line',
    height = 300,
    showPeriodSelector = true,
    trendPeriod = 6,
    showLegend = true,
    legendPosition = 'top',
    onTrendPeriodChange,
}: AnalyticsChartProps) {
    const { getToken } = useAuth();
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadChartData();
    }, [type, startDate, endDate, scope, scopeId, trendPeriod]);

    const loadChartData = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                setError('Not authenticated');
                return;
            }

            const api = createAuthenticatedClient(token);

            // Calculate date range from trend period if not explicitly provided
            let effectiveStartDate = startDate;
            let effectiveEndDate = endDate;

            if (!startDate && !endDate && trendPeriod) {
                const now = new Date();
                effectiveEndDate = now.toISOString().split('T')[0];
                const start = new Date(now);
                start.setMonth(start.getMonth() - trendPeriod);
                effectiveStartDate = start.toISOString().split('T')[0];
            }

            // Build query params
            const params: Record<string, string> = {};
            if (effectiveStartDate) params.start_date = effectiveStartDate;
            if (effectiveEndDate) params.end_date = effectiveEndDate;
            if (scope) params.scope = scope;
            if (scopeId) params.scope_id = scopeId;

            // Fetch chart data from analytics service
            const response: any = await api.get(`/charts/${type}`, { params });

            // Response structure: { data: { chart_type, time_range, data: { labels, datasets } } }
            // We need the nested 'data.data' which contains the Chart.js format
            const chartResponse = response?.data || response;
            const chartJsData = chartResponse?.data || chartResponse;

            setChartData(chartJsData);
        } catch (err: any) {
            console.error(`Failed to load chart data for ${type}:`, err);
            setError(err.message || 'Failed to load chart data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h3 className="text-lg font-bold">{title}</h3>
                    )}
                    {showPeriodSelector && onTrendPeriodChange && (
                        <TrendPeriodSelector
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={onTrendPeriodChange}
                        />
                    )}
                </div>
                <ChartLoadingState height={height} />
            </div>
        );
    }

    if (error || !chartData) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h3 className="text-lg font-bold">{title}</h3>
                    )}
                    {showPeriodSelector && onTrendPeriodChange && (
                        <TrendPeriodSelector
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={onTrendPeriodChange}
                        />
                    )}
                </div>
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error || 'No chart data available'}</span>
                </div>
            </div>
        );
    }

    // Select the appropriate chart component
    let ChartComponent;
    switch (chartComponent) {
        case 'bar':
            ChartComponent = Bar;
            break;
        case 'pie':
            ChartComponent = Pie;
            break;
        case 'doughnut':
            ChartComponent = Doughnut;
            break;
        case 'radar':
            ChartComponent = Radar;
            break;
        case 'polarArea':
            ChartComponent = PolarArea;
            break;
        case 'line':
        default:
            ChartComponent = Line;
            break;
    }

    // Handle undefined, invalid, or all-zero chart data
    const hasData = chartData?.datasets?.length > 0 &&
        chartData.datasets.some(ds => ds.data?.some(v => v !== 0));
    if (!chartData || !hasData) {
        const iconMap: Partial<Record<ChartType, string>> = {
            'earnings-trends': 'fa-sack-dollar',
            'placement-trends': 'fa-trophy',
            'submission-trends': 'fa-paper-plane',
        };
        const icon = iconMap[type] || 'fa-chart-line';
        return (
            <div style={{ height }} className="flex items-center justify-center text-base-content/50">
                <div className="text-center">
                    <i className={`fa-duotone fa-regular ${icon} fa-2x mb-1 opacity-20`}></i>
                    <p className="text-xs">No data yet</p>
                </div>
            </div>
        );
    }

    // Determine chart-specific options based on type
    const isPolarChart = ['pie', 'doughnut', 'radar', 'polarArea'].includes(chartComponent || 'line');

    return (
        <>
            <div className={`flex items-center ${title ? 'justify-between' : 'justify-end'}`}>
                {title && (
                    <h3 className="text-sm font-medium text-base-content/80">{title}</h3>
                )}
                {showPeriodSelector && onTrendPeriodChange && (
                    <TrendPeriodSelector
                        trendPeriod={trendPeriod}
                        onTrendPeriodChange={onTrendPeriodChange}
                    />
                )}
            </div>
            <div style={{ height }}>
                <ChartComponent
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: showLegend,
                                position: legendPosition,
                                labels: {
                                    usePointStyle: true,
                                },

                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            },
                        },
                        // Only include scales for line/bar charts, not for polar charts
                        ...(!isPolarChart && {
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        precision: 0,
                                    },
                                },
                            },
                        }),
                    }}
                />
            </div>
        </>
    );
}
