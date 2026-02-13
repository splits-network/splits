'use client';

import { useMemo, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { dataset, registerChart } from '@/components/charts/chart-options';
import { ChartLoadingState } from '@splits-network/shared-ui';

ChartJS.register(ArcElement, Tooltip);

interface JobSearchMomentumProps {
    recentActivityCount: number;
    responseRate: number;
    profileCompletion: number;
    activeRecruiters: number;
    loading?: boolean;
}

interface Segment {
    label: string;
    score: number;
    max: 25;
    color: string;
    bgColor: string;
    icon: string;
}

function calculateActivityScore(recentApps: number): number {
    if (recentApps === 0) return 0;
    if (recentApps <= 2) return 10;
    if (recentApps <= 5) return 18;
    return 25;
}

function calculateAdvancementScore(responseRate: number): number {
    if (responseRate === 0) return 0;
    if (responseRate <= 20) return 10;
    if (responseRate <= 50) return 18;
    return 25;
}

function calculateProfileScore(completion: number): number {
    return Math.round((completion / 100) * 25);
}

function calculateEngagementScore(recruiters: number): number {
    if (recruiters === 0) return 0;
    if (recruiters === 1) return 15;
    return 25;
}

export default function JobSearchMomentum({
    recentActivityCount,
    responseRate,
    profileCompletion,
    activeRecruiters,
    loading,
}: JobSearchMomentumProps) {
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    const segments: Segment[] = useMemo(() => [
        {
            label: 'Activity',
            score: calculateActivityScore(recentActivityCount),
            max: 25,
            color: dataset.primaryBorderColor,
            bgColor: dataset.primaryBackgroundColor,
            icon: 'fa-bolt',
        },
        {
            label: 'Advancement',
            score: calculateAdvancementScore(responseRate),
            max: 25,
            color: dataset.successBorderColor,
            bgColor: dataset.successBackgroundColor,
            icon: 'fa-arrow-trend-up',
        },
        {
            label: 'Profile',
            score: calculateProfileScore(profileCompletion),
            max: 25,
            color: dataset.infoBorderColor,
            bgColor: dataset.infoBackgroundColor,
            icon: 'fa-user-check',
        },
        {
            label: 'Engagement',
            score: calculateEngagementScore(activeRecruiters),
            max: 25,
            color: dataset.warningBorderColor,
            bgColor: dataset.warningBackgroundColor,
            icon: 'fa-handshake',
        },
    ], [recentActivityCount, responseRate, profileCompletion, activeRecruiters]);

    const totalScore = useMemo(
        () => segments.reduce((sum, s) => sum + s.score, 0),
        [segments]
    );

    const chartData = useMemo(() => ({
        labels: segments.map(s => s.label),
        datasets: [{
            data: segments.map(s => s.score),
            backgroundColor: segments.map(s => s.bgColor),
            borderColor: segments.map(s => s.color),
            borderWidth: 2,
            hoverOffset: 4,
        }],
    }), [segments]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
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
                callbacks: {
                    label: (context: any) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}/25`;
                    },
                },
            },
        },
    }), []);

    if (loading) {
        return (
            <div className="card bg-base-200 overflow-hidden h-full">
                <div className="m-1.5 shadow-lg rounded-xl bg-base-100 p-4">
                    <ChartLoadingState height={280} />
                </div>
            </div>
        );
    }

    const hasAnyData = totalScore > 0;

    return (
        <div className="card bg-base-200 overflow-hidden h-full">
            <div className="m-1.5 shadow-lg rounded-xl bg-base-100 p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-gauge-high text-secondary text-sm"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-base-content">Job Search Momentum</h3>
                        <p className="text-[10px] text-base-content/50">Your search health score</p>
                    </div>
                </div>

                {hasAnyData ? (
                    <>
                        {/* Chart with center score */}
                        <div className="relative h-[160px] flex-shrink-0">
                            <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-3xl font-bold text-base-content">{totalScore}</div>
                                <div className="text-[10px] text-base-content/50 font-medium">/ 100</div>
                            </div>
                        </div>

                        {/* Legend with mini progress bars */}
                        <div className="mt-3 space-y-2 flex-1">
                            {segments.map((seg) => (
                                <div key={seg.label} className="flex items-center gap-2">
                                    <i className={`fa-duotone fa-regular ${seg.icon} text-xs w-4 text-center`} style={{ color: seg.color }}></i>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-base-content/70">{seg.label}</span>
                                            <span className="font-semibold tabular-nums" style={{ color: seg.color }}>{seg.score}</span>
                                        </div>
                                        <div className="w-full bg-base-200 rounded-full h-1 mt-0.5">
                                            <div
                                                className="h-1 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(seg.score / seg.max) * 100}%`,
                                                    backgroundColor: seg.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3">
                            <i className="fa-duotone fa-regular fa-rocket text-xl text-base-content/30"></i>
                        </div>
                        <p className="text-sm font-medium text-base-content/60">Start your momentum</p>
                        <p className="text-xs text-base-content/40 mt-1">Apply to jobs to build your search score</p>
                    </div>
                )}
            </div>
        </div>
    );
}
