'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAdminStats, type TimePeriod } from '@/hooks/use-admin-stats';
import { useAdminChartData } from '@/hooks/use-admin-chart-data';
import { DashboardStats } from './components/dashboard-stats';
import { DashboardCharts } from './components/dashboard-charts';
import { DashboardActivity } from './components/dashboard-activity';
import { DashboardActions } from './components/dashboard-actions';
import { DashboardHealth } from './components/dashboard-health';
import { TimePeriodSelector } from './components/time-period-selector';

export default function SecurePage() {
    const { getToken } = useAuth();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
    const [token, setToken] = useState<string | null>(null);

    const { stats, loading, error, refetch } = useAdminStats(timePeriod);
    const chartData = useAdminChartData(timePeriod);

    // Fetch token once for health checks
    React.useEffect(() => {
        getToken()
            .then((t) => setToken(t))
            .catch(() => setToken(null));
    }, [getToken]);

    return (
        <div className="flex flex-col gap-6">
            {/* Page header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
                    <p className="text-sm text-base-content/60 mt-0.5">
                        Platform overview and key metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => void refetch()}
                        type="button"
                        title="Refresh stats"
                    >
                        <i className="fa-duotone fa-regular fa-arrows-rotate" />
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                    <span className="text-sm">
                        Could not load live stats — showing cached data. {error}
                    </span>
                </div>
            )}

            {/* KPI stat tiles */}
            <DashboardStats stats={stats} loading={loading} />

            {/* Actions + Activity + Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <DashboardActions stats={stats} loading={loading} />
                <DashboardActivity />
                <DashboardHealth token={token} />
            </div>

            {/* Charts */}
            <DashboardCharts timePeriod={timePeriod} stats={stats} chartData={chartData} />
        </div>
    );
}
