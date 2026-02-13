'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { useCommissionData } from '../hooks/use-commission-data';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { ChartLoadingState } from '@splits-network/shared-ui';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CommissionBreakdownProps {
    trendPeriod?: number;
    refreshKey?: number;
}

/**
 * Reads CSS custom properties to derive a theme-aware color palette
 * for the doughnut chart segments. Falls back to accessible defaults.
 */
function getThemeChartColors(): string[] {
    if (typeof window === 'undefined') {
        return ['#0f9d8a', '#233876', '#eab308', '#945769', '#0ea5e9'];
    }
    const style = getComputedStyle(document.documentElement);
    const read = (prop: string, fallback: string) => {
        const val = style.getPropertyValue(prop).trim();
        return val || fallback;
    };
    return [
        read('--color-secondary', '#0f9d8a'),   // Teal — Closer
        read('--color-primary', '#233876'),      // Brand — BD
        read('--color-warning', '#eab308'),      // Amber — Discovery
        read('--color-accent', '#945769'),       // Accent — Specs Owner
        read('--color-info', '#0ea5e9'),         // Info — Company Sourcer
    ];
}

function getThemeTextColor(): string {
    if (typeof window === 'undefined') return '#111827';
    return getComputedStyle(document.documentElement).getPropertyValue('--color-base-content').trim() || '#111827';
}

function getThemeSurfaceColor(): string {
    if (typeof window === 'undefined') return '#ffffff';
    return getComputedStyle(document.documentElement).getPropertyValue('--color-base-100').trim() || '#ffffff';
}

export default function CommissionBreakdown({ trendPeriod = 12, refreshKey }: CommissionBreakdownProps) {
    const { segments, total, loading, error } = useCommissionData(trendPeriod);
    const [chartColors, setChartColors] = useState<string[]>(getThemeChartColors());
    const [textColor, setTextColor] = useState(getThemeTextColor());
    const [surfaceColor, setSurfaceColor] = useState(getThemeSurfaceColor());

    // Re-read theme colors on theme changes
    useEffect(() => {
        const updateColors = () => {
            setChartColors(getThemeChartColors());
            setTextColor(getThemeTextColor());
            setSurfaceColor(getThemeSurfaceColor());
        };
        updateColors();

        const observer = new MutationObserver(updateColors);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    if (loading) {
        return (
            <ContentCard title="Commission breakdown" icon="fa-pie-chart" className="bg-base-200 h-full">
                <ChartLoadingState height={240} />
            </ContentCard>
        );
    }

    if (error || segments.length === 0) {
        return (
            <ContentCard title="Commission breakdown" icon="fa-pie-chart" className="bg-base-200 h-full">
                <EmptyState
                    icon="fa-pie-chart"
                    title="No commissions yet"
                    description="Complete your first placement to see how your commissions break down by role."
                    size="sm"
                />
            </ContentCard>
        );
    }

    const sliceColors = chartColors.slice(0, segments.length);

    const chartData = {
        labels: segments.map(s => s.role),
        datasets: [{
            data: segments.map(s => s.amount),
            backgroundColor: sliceColors.map(c => `${c}cc`),  // 80% opacity for softer fill
            borderColor: sliceColors,
            borderWidth: 2,
            hoverOffset: 8,
            hoverBorderWidth: 3,
        }],
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
        return `$${value.toLocaleString()}`;
    };

    return (
        <ContentCard title="Commission breakdown" icon="fa-pie-chart" className="bg-base-200 h-full">
            {/* Chart + center label */}
            <div className="relative">
                <div className="h-56 w-full">
                    <Doughnut
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '62%',
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                    labels: {
                                        color: textColor,
                                        usePointStyle: true,
                                        pointStyle: 'circle',
                                        padding: 14,
                                        font: { size: 11, weight: 'normal' },
                                    },
                                },
                                tooltip: {
                                    backgroundColor: surfaceColor,
                                    titleColor: textColor,
                                    bodyColor: textColor,
                                    borderColor: `${textColor}20`,
                                    borderWidth: 1,
                                    padding: 10,
                                    cornerRadius: 8,
                                    displayColors: true,
                                    callbacks: {
                                        label: (ctx) => {
                                            const value = ctx.parsed;
                                            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                                            return ` ${ctx.label}: ${formatCurrency(value)} (${pct}%)`;
                                        },
                                    },
                                },
                            },
                        }}
                    />
                </div>
                {/* Center text overlay — positioned within chart area, above legend */}
                <div
                    className="absolute inset-x-0 top-0 flex flex-col items-center justify-center pointer-events-none"
                    style={{ height: 'calc(100% - 40px)' }}
                >
                    <span className="text-[10px] uppercase tracking-wider text-base-content/60 font-medium">Total earned</span>
                    <span className="text-xl font-bold tabular-nums text-base-content">{formatCurrency(total)}</span>
                </div>
            </div>
        </ContentCard>
    );
}
