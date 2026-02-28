'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/shared';
import { TimePeriodSelector } from '../components/time-period-selector';
import { LineChart, BarChart } from '@splits-network/shared-charts';
import type { TimePeriod } from '@/hooks/use-admin-stats';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getChartData(period: TimePeriod) {
    const len = period === '7d' ? 7 : period === '30d' ? 10 : period === '90d' ? 12 : 12;
    const labels = MONTHS.slice(0, len);
    return {
        signups: labels.map((x, i) => ({ x, y: 15 + i * 4 + Math.floor(i * 2) })),
        jobs: labels.map((x, i) => ({ x, y: 8 + i * 3 + Math.floor(i * 1.5) })),
        applications: labels.map((label, i): { label: string; value: number } => ({ label, value: 40 + i * 12 })),
        revenue: labels.map((x, i) => ({ x, y: 5000 + i * 800 })),
    };
}

export default function MetricsPage() {
    const [period, setPeriod] = useState<TimePeriod>('30d');
    const chartData = getChartData(period);

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
                        <LineChart
                            data={chartData.signups}
                            height={200}
                        />
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Job Postings</h2>
                        <LineChart
                            data={chartData.jobs}
                            height={200}
                        />
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Application Volume</h2>
                        <BarChart
                            data={chartData.applications}
                            height={200}
                        />
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-base">Revenue</h2>
                        <LineChart
                            data={chartData.revenue}
                            height={200}
                        />
                    </div>
                </div>
            </div>

            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-chart-line" />
                <p className="text-sm">
                    More metrics and real-time analytics coming soon as endpoints stabilize.
                </p>
            </div>
        </div>
    );
}
