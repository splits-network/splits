'use client';

import React from 'react';
import { LineChart, BarChart, PieChart, AreaChart } from '@splits-network/shared-charts';
import type { AdminStats } from '@/hooks/use-admin-stats';
import type { ChartDataResult } from '@/hooks/use-admin-chart-data';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    loading?: boolean;
}

function ChartCard({ title, children, loading }: ChartCardProps) {
    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-3">
                <h3 className="font-semibold text-sm">{title}</h3>
                {loading ? (
                    <div className="skeleton h-[220px] w-full" />
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

interface DashboardChartsProps {
    timePeriod: string;
    stats: AdminStats;
    chartData: ChartDataResult;
}

export function DashboardCharts({ stats, chartData }: DashboardChartsProps) {
    const { loading } = chartData;

    const recruiterPieData = stats.recruiterStatus.map((d) => ({ name: d.label, value: d.value }));
    const applicationFunnelData = stats.applicationFunnel.map((d) => ({ label: d.label, value: d.value }));

    return (
        <div className="flex flex-col gap-4">
            {/* Row 1: Growth trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="User Growth" loading={loading}>
                    <AreaChart data={chartData.userGrowth} height={220} smooth gradient />
                </ChartCard>
                <ChartCard title="Job Postings" loading={loading}>
                    <BarChart data={chartData.jobPostings} height={220} />
                </ChartCard>
            </div>

            {/* Row 2: Volume and funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Application Volume" loading={loading}>
                    <LineChart data={chartData.applicationVolume} height={220} smooth />
                </ChartCard>
                <ChartCard title="Application Funnel" loading={loading}>
                    <BarChart data={applicationFunnelData} horizontal height={220} />
                </ChartCard>
            </div>

            {/* Row 3: Distribution and multi-series */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Recruiter Status" loading={loading}>
                    <PieChart data={recruiterPieData} donut height={220} showLabels={false} />
                </ChartCard>
                <ChartCard title="Applications vs Hires" loading={loading}>
                    <LineChart
                        series={chartData.hiringFunnel}
                        xLabels={chartData.hiringFunnelLabels}
                        height={220}
                        showLegend
                        smooth
                    />
                </ChartCard>
            </div>
        </div>
    );
}
