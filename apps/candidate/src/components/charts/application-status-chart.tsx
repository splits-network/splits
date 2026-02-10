'use client';

import { useMemo, useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { dataset, registerChart } from './chart-options';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

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
}

const STATUS_GROUPS = {
    active: ['submitted', 'screen', 'interview', 'final_interview'],
    review: ['ai_review', 'recruiter_request'],
    offers: ['offer'],
    archived: ['rejected', 'withdrawn'],
};

export default function ApplicationStatusChart({
    applications,
    loading,
}: ApplicationStatusChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Calculate status distribution
    const statusData = useMemo(() => {
        const counts = {
            active: 0,
            review: 0,
            offers: 0,
            archived: 0,
        };

        applications.forEach((app) => {
            // Check if job is closed/filled (should be archived)
            if (app.job?.status === 'closed' || app.job?.status === 'filled') {
                counts.archived++;
            } else if (STATUS_GROUPS.active.includes(app.stage)) {
                counts.active++;
            } else if (STATUS_GROUPS.review.includes(app.stage)) {
                counts.review++;
            } else if (STATUS_GROUPS.offers.includes(app.stage)) {
                counts.offers++;
            } else if (STATUS_GROUPS.archived.includes(app.stage)) {
                counts.archived++;
            }
        });

        const total = applications.length;
        const percentages = {
            active: total > 0 ? Math.round((counts.active / total) * 100) : 0,
            review: total > 0 ? Math.round((counts.review / total) * 100) : 0,
            offers: total > 0 ? Math.round((counts.offers / total) * 100) : 0,
            archived: total > 0 ? Math.round((counts.archived / total) * 100) : 0,
        };

        return { counts, percentages, total };
    }, [applications]);

    // Chart data configuration
    const chartData = useMemo(() => ({
        labels: ['Active', 'In Review', 'Offers', 'Archived'],
        datasets: [
            {
                data: [
                    statusData.counts.active,
                    statusData.counts.review,
                    statusData.counts.offers,
                    statusData.counts.archived,
                ],
                backgroundColor: [
                    dataset.successBackgroundColor,
                    dataset.infoBackgroundColor,
                    dataset.warningBackgroundColor,
                    dataset.neutralBackgroundColor,
                ],
                borderColor: [
                    dataset.successBorderColor,
                    dataset.infoBorderColor,
                    dataset.warningBorderColor,
                    dataset.neutralBorderColor,
                ],
                borderWidth: 2,
            },
        ],
    }), [statusData]);

    // Chart options
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
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
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    }), []);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
        );
    }

    // Empty state
    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-60 text-base-content/60">
                <i className="fa-duotone fa-regular fa-chart-pie text-2xl mb-2"></i>
                <p className="text-sm">No application data yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <h3 className="text-sm font-medium text-base-content/80">Application Status</h3>

            {/* Chart with center text */}
            <div className="relative h-48">
                <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold text-primary">
                        {statusData.counts.active}
                    </div>
                    <div className="text-xs text-base-content/70">Active</div>
                </div>
            </div>

            {/* Legend with percentages */}
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: dataset.successBorderColor }}></span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-base-content/70">Active</span>
                            <span className="font-medium">{statusData.percentages.active}%</span>
                        </div>
                        <div className="text-base-content/50">{statusData.counts.active} apps</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: dataset.infoBorderColor }}></span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-base-content/70">In Review</span>
                            <span className="font-medium">{statusData.percentages.review}%</span>
                        </div>
                        <div className="text-base-content/50">{statusData.counts.review} apps</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: dataset.warningBorderColor }}></span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-base-content/70">Offers</span>
                            <span className="font-medium">{statusData.percentages.offers}%</span>
                        </div>
                        <div className="text-base-content/50">{statusData.counts.offers} apps</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: dataset.neutralBorderColor }}></span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-base-content/70">Archived</span>
                            <span className="font-medium">{statusData.percentages.archived}%</span>
                        </div>
                        <div className="text-base-content/50">{statusData.counts.archived} apps</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
