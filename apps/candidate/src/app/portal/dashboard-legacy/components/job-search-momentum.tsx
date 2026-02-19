'use client';

import { useMemo, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { dataset, registerChart } from '@/components/charts/chart-options';
import { Card } from '@splits-network/memphis-ui';
import { ChartLoadingState } from '@splits-network/shared-ui';
import { ACCENT } from './accent';
import {
    ACCENT_HEX,
    ACCENT_HEX_LIGHT,
    type AccentColor,
} from '@splits-network/memphis-ui';

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
    accent: AccentColor;
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
            accent: 'coral',
            icon: 'fa-bolt',
        },
        {
            label: 'Advancement',
            score: calculateAdvancementScore(responseRate),
            max: 25,
            accent: 'teal',
            icon: 'fa-arrow-trend-up',
        },
        {
            label: 'Profile',
            score: calculateProfileScore(profileCompletion),
            max: 25,
            accent: 'purple',
            icon: 'fa-user-check',
        },
        {
            label: 'Engagement',
            score: calculateEngagementScore(activeRecruiters),
            max: 25,
            accent: 'yellow',
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
            backgroundColor: segments.map(s => ACCENT_HEX_LIGHT[s.accent]),
            borderColor: segments.map(s => ACCENT_HEX[s.accent]),
            borderWidth: 3,
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
                cornerRadius: 0,
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
            <Card className="border-4 border-dark h-full">
                <div className="p-4">
                    <ChartLoadingState height={280} />
                </div>
            </Card>
        );
    }

    const hasAnyData = totalScore > 0;

    return (
        <Card className="border-4 border-dark h-full">
            {/* Header */}
            <div className="border-b-4 border-dark px-5 py-3 flex items-center gap-2">
                <div className={`w-6 h-6 border-4 border-dark bg-teal flex items-center justify-center`}>
                    <i className="fa-duotone fa-regular fa-gauge-high text-[10px] text-dark"></i>
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-dark">Job Search Momentum</h3>
                    <p className="text-[10px] text-dark/40">Your search health score</p>
                </div>
            </div>

            <div className="p-5 flex flex-col h-[calc(100%-60px)]">
                {hasAnyData ? (
                    <>
                        {/* Chart with center score */}
                        <div className="relative h-[160px] flex-shrink-0">
                            <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-3xl font-black text-dark">{totalScore}</div>
                                <div className="text-[10px] text-dark/40 font-bold uppercase tracking-widest">/ 100</div>
                            </div>
                        </div>

                        {/* Legend with mini progress bars */}
                        <div className="mt-3 space-y-2 flex-1">
                            {segments.map((seg) => (
                                <div key={seg.label} className="flex items-center gap-2">
                                    <div className={`w-5 h-5 border-4 border-dark bg-${seg.accent} flex items-center justify-center shrink-0`}>
                                        <i className={`fa-duotone fa-regular ${seg.icon} text-[8px]`} style={{ color: ACCENT_HEX[seg.accent] === '#FFE66D' || ACCENT_HEX[seg.accent] === '#4ECDC4' ? '#1A1A2E' : '#FFFFFF' }}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-dark/50 font-bold uppercase tracking-widest">{seg.label}</span>
                                            <span className="font-black tabular-nums" style={{ color: ACCENT_HEX[seg.accent] }}>{seg.score}</span>
                                        </div>
                                        <div className="w-full bg-dark/10 h-1 mt-0.5">
                                            <div
                                                className="h-1 transition-all duration-500"
                                                style={{
                                                    width: `${(seg.score / seg.max) * 100}%`,
                                                    backgroundColor: ACCENT_HEX[seg.accent],
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
                        <div className="w-12 h-12 border-4 border-dark bg-teal/10 flex items-center justify-center mb-3">
                            <i className="fa-duotone fa-regular fa-rocket text-xl text-dark/30"></i>
                        </div>
                        <p className="text-sm font-bold text-dark/60">Start your momentum</p>
                        <p className="text-[10px] text-dark/40 mt-1">Apply to jobs to build your search score</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
