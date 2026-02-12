'use client';

import { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { useReputationData } from '../hooks/use-reputation-data';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { ChartLoadingState } from '@splits-network/shared-ui';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ReputationRadarProps {
    refreshKey?: number;
}

interface ThemeColors {
    secondary: string;
    text: string;
    grid: string;
    surface: string;
}

function getThemeColors(): ThemeColors {
    if (typeof window === 'undefined') {
        return { secondary: '#0f9d8a', text: '#18181b', grid: '#e4e4e7', surface: '#ffffff' };
    }
    const style = getComputedStyle(document.documentElement);
    const read = (prop: string, fallback: string) => style.getPropertyValue(prop).trim() || fallback;
    return {
        secondary: read('--color-secondary', '#0f9d8a'),
        text: read('--color-base-content', '#18181b'),
        grid: read('--color-base-300', '#e4e4e7'),
        surface: read('--color-base-100', '#ffffff'),
    };
}

/** Compute average reputation score across all 5 axes */
function computeOverallScore(metrics: { speed: number; volume: number; quality: number; collaboration: number; consistency: number }) {
    const values = [metrics.speed, metrics.volume, metrics.quality, metrics.collaboration, metrics.consistency];
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export default function ReputationRadar({ refreshKey }: ReputationRadarProps) {
    const { metrics, loading, error } = useReputationData();
    const [colors, setColors] = useState<ThemeColors>(getThemeColors());

    // Watch for theme changes
    useEffect(() => {
        const update = () => setColors(getThemeColors());
        update();

        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    if (loading) {
        return (
            <ContentCard title="Reputation score" icon="fa-shield-check" className="bg-base-200">
                <ChartLoadingState height={220} />
            </ContentCard>
        );
    }

    const hasData = metrics.speed > 0 || metrics.volume > 0 || metrics.quality > 0 ||
        metrics.collaboration > 0 || metrics.consistency > 0;

    if (error || !hasData) {
        return (
            <ContentCard title="Reputation score" icon="fa-shield-check" className="bg-base-200">
                <EmptyState
                    icon="fa-shield-check"
                    title="No reputation data yet"
                    description="Your reputation score builds automatically as you complete placements and collaborate with partners."
                    size="sm"
                />
            </ContentCard>
        );
    }

    const overallScore = computeOverallScore(metrics);

    const chartData = {
        labels: ['Speed', 'Volume', 'Quality', 'Collaboration', 'Consistency'],
        datasets: [{
            label: 'Your scores',
            data: [metrics.speed, metrics.volume, metrics.quality, metrics.collaboration, metrics.consistency],
            backgroundColor: `${colors.secondary}20`,
            borderColor: colors.secondary,
            borderWidth: 2,
            pointBackgroundColor: colors.secondary,
            pointBorderColor: colors.surface,
            pointHoverBackgroundColor: colors.surface,
            pointHoverBorderColor: colors.secondary,
            pointRadius: 4,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
        }],
    };

    return (
        <ContentCard
            title="Reputation score"
            icon="fa-shield-check"
            className="bg-base-200"
            headerActions={
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-base-content/60 font-medium">Overall score</span>
                    <span className="text-sm font-bold tabular-nums text-secondary">{overallScore}/100</span>
                </div>
            }
        >
            <div className="h-52">
                <Radar
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    stepSize: 25,
                                    display: false,
                                },
                                pointLabels: {
                                    color: colors.text,
                                    font: { size: 10, weight: 500 },
                                },
                                grid: {
                                    circular: true,
                                    color: `${colors.grid}80`,
                                },
                                angleLines: {
                                    color: `${colors.grid}60`,
                                },
                            },
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: colors.surface,
                                titleColor: colors.text,
                                bodyColor: colors.text,
                                borderColor: `${colors.text}20`,
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 8,
                                callbacks: {
                                    label: (ctx) => ` ${ctx.label}: ${ctx.parsed.r}/100`,
                                },
                            },
                        },
                    }}
                />
            </div>
        </ContentCard>
    );
}
