'use client';

import { useMemo, useRef, useEffect } from 'react';
import { ChartLoadingState } from '@splits-network/shared-ui';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { dataset, registerChart } from './chart-options';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Application {
    id: string;
    stage: string;
    job?: {
        status?: string;
    };
}

interface ApplicationStatusChartProps {
    applications: Application[];
    loading?: boolean;
    compact?: boolean;
}

// Complete stage-to-group mapping covering all 17 ATS stages
const STAGE_TO_GROUP: Record<string, string> = {
    // In Review — pre-submission stages
    draft: 'review',
    ai_review: 'review',
    ai_reviewed: 'review',
    recruiter_request: 'review',
    recruiter_proposed: 'review',
    recruiter_review: 'review',
    // Active — submitted to company and progressing
    submitted: 'active',
    company_review: 'active',
    company_feedback: 'active',
    screen: 'active',
    interview: 'active',
    final_interview: 'active',
    // Offers
    offer: 'offers',
    // Placed
    hired: 'placed',
    // Archived
    rejected: 'archived',
    withdrawn: 'archived',
    expired: 'archived',
};

const GROUP_CONFIG = [
    { key: 'active', label: 'Active', bg: dataset.primaryBackgroundColor, border: dataset.primaryBorderColor },
    { key: 'review', label: 'In Review', bg: dataset.infoBackgroundColor, border: dataset.infoBorderColor },
    { key: 'offers', label: 'Offers', bg: dataset.warningBackgroundColor, border: dataset.warningBorderColor },
    { key: 'placed', label: 'Placed', bg: dataset.successBackgroundColor, border: dataset.successBorderColor },
    { key: 'archived', label: 'Archived', bg: dataset.neutralBackgroundColor, border: dataset.neutralBorderColor },
] as const;

export default function ApplicationStatusChart({
    applications,
    loading,
    compact,
}: ApplicationStatusChartProps) {
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {
            active: 0,
            review: 0,
            offers: 0,
            placed: 0,
            archived: 0,
        };

        applications.forEach((app) => {
            if (app.job?.status === 'closed' || app.job?.status === 'filled') {
                counts.archived++;
            } else {
                const group = STAGE_TO_GROUP[app.stage];
                if (group && counts[group] !== undefined) {
                    counts[group]++;
                }
            }
        });

        const total = applications.length;
        const activeTotal = counts.active + counts.review + counts.offers;

        return { counts, total, activeTotal };
    }, [applications]);

    const chartData = useMemo(() => ({
        labels: GROUP_CONFIG.map(g => g.label),
        datasets: [{
            data: GROUP_CONFIG.map(g => statusData.counts[g.key]),
            backgroundColor: GROUP_CONFIG.map(g => g.bg),
            borderColor: GROUP_CONFIG.map(g => g.border),
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 4,
        }],
    }), [statusData]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: dataset.base100BorderColor,
                titleColor: dataset.baseContentBorderColor,
                bodyColor: dataset.baseContentBorderColor,
                borderColor: dataset.base300BorderColor,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                        return ` ${label}: ${value} (${pct}%)`;
                    },
                },
            },
        },
    }), []);

    if (loading) {
        return <ChartLoadingState height={compact ? 200 : 240} />;
    }

    if (applications.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center ${compact ? 'h-[200px]' : 'h-60'} text-base-content/60`}>
                <i className="fa-duotone fa-regular fa-chart-pie text-2xl mb-2"></i>
                <p className="text-sm">No application data yet</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-3">
                {/* Chart with center text */}
                <div className="relative h-[200px]">
                    <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-2xl font-bold text-primary tabular-nums">
                            {statusData.activeTotal}
                        </div>
                        <div className="text-[10px] text-base-content/50 font-medium">Active</div>
                    </div>
                </div>

                {/* Compact legend */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                    {GROUP_CONFIG.map((g) => (
                        <div key={g.key} className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: g.border }}
                            ></span>
                            <span className="text-[11px] text-base-content/60">
                                {g.label}
                            </span>
                            <span className="text-[11px] font-semibold tabular-nums text-base-content/80">
                                {statusData.counts[g.key]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-base-content/80">Application Status</h3>

            <div className="relative h-48">
                <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold text-primary tabular-nums">
                        {statusData.activeTotal}
                    </div>
                    <div className="text-xs text-base-content/50">Active</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                {GROUP_CONFIG.map((g) => {
                    const count = statusData.counts[g.key];
                    const pct = statusData.total > 0 ? Math.round((count / statusData.total) * 100) : 0;
                    return (
                        <div key={g.key} className={`flex items-center gap-2 ${g.key === 'archived' ? 'col-span-2' : ''}`}>
                            <span
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: g.border }}
                            ></span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-base-content/70">{g.label}</span>
                                    <span className="font-medium tabular-nums">{pct}%</span>
                                </div>
                                <div className="text-base-content/50 tabular-nums">{count} apps</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
