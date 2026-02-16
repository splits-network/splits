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
import { useCompanyHealth } from '../hooks/use-company-health';
import { ContentCard, EmptyState } from '@/components/ui/cards';
import { ChartLoadingState } from '@splits-network/shared-ui';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface CompanyHealthRadarProps {
    refreshKey?: number;
}

interface ThemeColors {
    primary: string;
    text: string;
    grid: string;
    surface: string;
}

function getThemeColors(): ThemeColors {
    if (typeof window === 'undefined') {
        return { primary: '#233876', text: '#111827', grid: '#e5e7eb', surface: '#ffffff' };
    }
    const style = getComputedStyle(document.documentElement);
    const read = (prop: string, fallback: string) => style.getPropertyValue(prop).trim() || fallback;
    return {
        primary: read('--color-primary', '#233876'),
        text: read('--color-base-content', '#18181b'),
        grid: read('--color-base-300', '#e4e4e7'),
        surface: read('--color-base-100', '#ffffff'),
    };
}

function computeOverallScore(metrics: { timeToFill: number; candidateFlow: number; interviewRate: number; offerRate: number; fillRate: number }) {
    const values = [metrics.timeToFill, metrics.candidateFlow, metrics.interviewRate, metrics.offerRate, metrics.fillRate];
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export default function CompanyHealthRadar({ refreshKey }: CompanyHealthRadarProps) {
    const { metrics, loading, error } = useCompanyHealth();
    const [colors, setColors] = useState<ThemeColors>(getThemeColors());

    useEffect(() => {
        const update = () => setColors(getThemeColors());
        update();

        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    if (loading) {
        return (
            <ContentCard title="Role health" icon="fa-heart-pulse" className="bg-base-200 h-full">
                <ChartLoadingState height={240} />
            </ContentCard>
        );
    }

    const hasData = metrics.timeToFill > 0 || metrics.candidateFlow > 0 || metrics.interviewRate > 0 ||
        metrics.offerRate > 0 || metrics.fillRate > 0;

    if (error || !hasData) {
        return (
            <ContentCard title="Role health" icon="fa-heart-pulse" className="bg-base-200 h-full">
                <EmptyState
                    icon="fa-heart-pulse"
                    title="No health data yet"
                    description="Post roles and receive candidates to see your hiring health metrics across five dimensions."
                    size="sm"
                />
            </ContentCard>
        );
    }

    const overallScore = computeOverallScore(metrics);

    const chartData = {
        labels: ['Time-to-Fill', 'Candidate Flow', 'Interview Rate', 'Offer Rate', 'Fill Rate'],
        datasets: [{
            label: 'Health scores',
            data: [metrics.timeToFill, metrics.candidateFlow, metrics.interviewRate, metrics.offerRate, metrics.fillRate],
            backgroundColor: `${colors.primary}20`,
            borderColor: colors.primary,
            borderWidth: 2,
            pointBackgroundColor: colors.primary,
            pointBorderColor: colors.surface,
            pointHoverBackgroundColor: colors.surface,
            pointHoverBorderColor: colors.primary,
            pointRadius: 4,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
        }],
    };

    return (
        <ContentCard
            title="Role health"
            icon="fa-heart-pulse"
            className="bg-base-200 h-full"
            headerActions={
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-base-content/60 font-medium">Health score</span>
                    <span className="text-sm font-bold tabular-nums text-primary">{overallScore}/100</span>
                </div>
            }
        >
            <div className="h-56 lg:h-72">
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
