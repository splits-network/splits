'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/shared';
import { TimePeriodSelector } from '../components/time-period-selector';
import { LineChart, BarChart } from '@splits-network/shared-charts';
import type { TimePeriod } from '@/hooks/use-admin-stats';
import { useAdminChartData } from '@/hooks/use-admin-chart-data';

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
                        ) : (
                            <LineChart data={chartData.userGrowth} height={200} />
                        )}
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Job Postings</h2>
                        {chartData.loading ? (
                            <div className="skeleton h-[200px] w-full" />
                        ) : (
                            <LineChart
                                data={chartData.jobPostings.map((d) => ({ x: d.label, y: d.value }))}
                                height={200}
                            />
                        )}
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Application Volume</h2>
                        {chartData.loading ? (
                            <div className="skeleton h-[200px] w-full" />
                        ) : (
                            <BarChart
                                data={chartData.applicationVolume.map((d) => ({ label: d.x, value: d.y }))}
                                height={200}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
