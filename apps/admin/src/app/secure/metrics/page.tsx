'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/shared';
import { TimePeriodSelector } from '../components/time-period-selector';
import { LineChart, BarChart } from '@splits-network/shared-charts';
import type { TimePeriod } from '@/hooks/use-admin-stats';
import { useAdminChartData } from '@/hooks/use-admin-chart-data';

function ChartEmpty() {
    return (
        <div className="flex flex-col items-center justify-center h-[200px] text-base-content/30">
            <i className="fa-duotone fa-regular fa-chart-simple text-3xl mb-2" />
            <p className="text-sm">No data yet</p>
        </div>
    );
}

export default function MetricsPage() {
    const [period, setPeriod] = useState<TimePeriod>('30d');
    const chartData = useAdminChartData(period);

    return (
        <div>
            <AdminPageHeader
                title="Metrics"
                subtitle="Platform analytics and performance metrics"
                actions={<TimePeriodSelector value={period} onChange={setPeriod} />}
            />

            <div className="grid gap-4 lg:grid-cols-2 mb-6">
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">User Signups</h2>
                        {chartData.loading ? (
                            <div className="skeleton h-[200px] w-full" />
                        ) : chartData.userGrowth.length > 0 ? (
                            <LineChart data={chartData.userGrowth} height={200} />
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Job Postings</h2>
                        {chartData.loading ? (
                            <div className="skeleton h-[200px] w-full" />
                        ) : chartData.jobPostings.length > 0 ? (
                            <LineChart
                                data={chartData.jobPostings.map((d) => ({ x: d.label, y: d.value }))}
                                height={200}
                            />
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Application Volume</h2>
                        {chartData.loading ? (
                            <div className="skeleton h-[200px] w-full" />
                        ) : chartData.applicationVolume.length > 0 ? (
                            <BarChart
                                data={chartData.applicationVolume.map((d) => ({ label: d.x, value: d.y }))}
                                height={200}
                            />
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
