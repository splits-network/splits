'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { usePlatformPipeline } from '../hooks/use-platform-pipeline';
import { useMarketplaceHealth } from '../hooks/use-marketplace-health';
import { usePlatformActivity } from '../hooks/use-platform-activity';
import { useTopPerformers } from '../hooks/use-top-performers';
import { usePlatformFinancials } from '../hooks/use-platform-financials';
import { useDashboardRealtime } from '../hooks/use-dashboard-realtime';
import { StatCard, StatCardGrid } from '@/components/ui/cards';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { PageTitle } from '@/components/page-title';
import { TrendPeriodSelector } from '@/components/charts/trend-period-selector';
import PlatformAlertsBar from './admin/platform-alerts-bar';
import PlatformPipelineFunnel from './admin/platform-pipeline-funnel';
import MarketplaceHealthRadar from './admin/marketplace-health-radar';
import PlatformActivityTable from './admin/platform-activity-table';
import TopPerformers from './admin/top-performers';
import PendingActionsCard from './admin/pending-actions-card';
import RoleDistributionDoughnut from './admin/role-distribution-doughnut';
import RecruiterStatusBreakdown from './admin/recruiter-status-breakdown';
import FinancialSummaryCard from './admin/financial-summary-card';
import SubscriptionOverview from './admin/subscription-overview';

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
}

export default function AdminDashboard() {
    const { userId } = useAuth();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [chartRefreshKey, setChartRefreshKey] = useState(0);

    // ── Independent data hooks ──
    const { stats, loading: statsLoading, refresh: refreshStats } = usePlatformStats();
    const { stages, loading: pipelineLoading, refresh: refreshPipeline } = usePlatformPipeline();
    const { health, loading: healthLoading, refresh: refreshHealth } = useMarketplaceHealth();
    const { events, loading: activityLoading, refresh: refreshActivity } = usePlatformActivity();
    const { performers, loading: performersLoading, refresh: refreshPerformers } = useTopPerformers();
    const { financials, loading: financialsLoading } = usePlatformFinancials(stats, statsLoading);

    // ── Real-time WebSocket updates ──
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);

    const handleChartsUpdate = useCallback(() => {
        setChartRefreshKey((k) => k + 1);
    }, []);

    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshPipeline();
        refreshHealth();
        refreshActivity();
        refreshPerformers();
        setChartRefreshKey((k) => k + 1);
    }, [refreshStats, refreshPipeline, refreshHealth, refreshActivity, refreshPerformers]);

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
    });

    // ── 60s polling for aggregate freshness ──
    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
            refreshActivity();
            refreshPerformers();
        }, 60_000);
        return () => clearInterval(interval);
    }, [refreshStats, refreshActivity, refreshPerformers]);

    return (
        <div className="space-y-8 animate-fade-in">
            <PageTitle
                title="Platform Command Center"
                subtitle="Real-time marketplace administration and insights"
            >
                <TrendPeriodSelector
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
                <div className="hidden lg:block w-px h-6 bg-base-300" />
                <Link href="/portal/admin/recruiters" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-user-tie w-3.5"></i>
                    Recruiters
                </Link>
                <Link href="/portal/admin/payouts" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-money-bill-transfer w-3.5"></i>
                    Payouts
                </Link>
                <Link href="/portal/admin/fraud" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-shield-exclamation w-3.5"></i>
                    Fraud
                </Link>
                <Link href="/portal/admin/metrics" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-chart-line w-3.5"></i>
                    Metrics
                </Link>
            </PageTitle>

            {/* ── Section 0: Platform Alerts Bar (conditional) ── */}
            {!statsLoading && <PlatformAlertsBar stats={stats} />}

            {/* ── Section 1: KPI Strip (7 cards) ── */}
            <StatCardGrid className="shadow-lg w-full">
                {statsLoading ? (
                    [1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <StatCard key={i} title="" value={0} icon="fa-spinner" loading />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Active jobs"
                            value={stats.active_jobs}
                            description={`${stats.total_jobs.toLocaleString()} total`}
                            icon="fa-briefcase"
                            color="primary"
                            trend={stats.trends?.active_jobs}
                            href="/portal/admin/jobs"
                        />
                        <StatCard
                            title="Active recruiters"
                            value={stats.active_recruiters}
                            description={`${stats.active_companies} companies`}
                            icon="fa-user-tie"
                            color="secondary"
                            trend={stats.trends?.active_recruiters}
                            href="/portal/admin/recruiters"
                        />
                        <StatCard
                            title="Candidates"
                            value={stats.total_candidates}
                            description={`${stats.new_signups_mtd} new this month`}
                            icon="fa-id-card"
                            color="accent"
                            href="/portal/admin/candidates"
                        />
                        <StatCard
                            title="Applications"
                            value={stats.total_applications}
                            description="In pipeline"
                            icon="fa-file-lines"
                            color="info"
                            trend={stats.trends?.total_applications}
                            href="/portal/admin/applications"
                        />
                        <StatCard
                            title="Placements YTD"
                            value={stats.total_placements}
                            description={`${stats.placements_this_month} this month`}
                            icon="fa-trophy"
                            color="success"
                            trend={stats.trends?.total_placements}
                            href="/portal/admin/placements"
                        />
                        <StatCard
                            title="Revenue YTD"
                            value={formatCurrency(stats.total_revenue)}
                            description="Platform share"
                            icon="fa-sack-dollar"
                            color="warning"
                            trend={stats.trends?.total_revenue}
                            href="/portal/admin/metrics"
                        />
                        <StatCard
                            title="Pending payouts"
                            value={formatCurrency(stats.pending_payouts_amount)}
                            description={`${stats.pending_payouts_count} awaiting`}
                            icon="fa-money-bill-transfer"
                            color="error"
                            href="/portal/admin/payouts"
                        />
                    </>
                )}
            </StatCardGrid>

            {/* ── Section 2: Hero — Asymmetric 7/5 split ── */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                    <PlatformPipelineFunnel
                        stages={stages}
                        loading={pipelineLoading}
                    />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <MarketplaceHealthRadar
                        health={health}
                        loading={healthLoading}
                    />
                </div>
            </div>

            {/* ── Section 3: Trend Charts (3-column, elevation pattern) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Recruiter Growth -- Bar chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Recruiter growth"
                                icon="fa-user-plus"
                                color="secondary"
                                description="New recruiter signups"
                                value={stats.total_recruiters}
                                trend={stats.trends?.active_recruiters}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <AnalyticsChart
                            key={`recruiter-growth-trends-${chartRefreshKey}`}
                            type="recruiter-growth-trends"
                            chartComponent="bar"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="platform"
                            height={140}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>

                {/* Application Volume -- Line chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Application volume"
                                icon="fa-file-lines"
                                color="info"
                                description="Total applications in pipeline"
                                value={stats.total_applications}
                                trend={stats.trends?.total_applications}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <AnalyticsChart
                            key={`application-trends-${chartRefreshKey}`}
                            type="application-trends"
                            chartComponent="line"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="platform"
                            height={140}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>

                {/* Revenue Trend -- Line chart */}
                <div className="card bg-base-200 overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Revenue trend"
                                icon="fa-sack-dollar"
                                color="warning"
                                description="Platform revenue year to date"
                                value={formatCurrency(stats.total_revenue)}
                                trend={stats.trends?.total_revenue}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <AnalyticsChart
                            key={`platform-revenue-trends-${chartRefreshKey}`}
                            type="platform-revenue-trends"
                            chartComponent="line"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="platform"
                            height={140}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>
            </div>

            {/* ── Section 3b: User Growth by Type (full width, elevation pattern) ── */}
            <div className="card bg-base-200 overflow-hidden">
                <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                    {statsLoading ? (
                        <StatCard title="" value={0} icon="fa-spinner" loading />
                    ) : (
                        <StatCard
                            title="User growth by type"
                            icon="fa-users"
                            color="accent"
                            description="Recruiters, candidates, and companies over time"
                            value={stats.total_users}
                        />
                    )}
                </div>
                <div className="px-4 pb-4 pt-2">
                    <AnalyticsChart
                        key={`user-growth-by-type-${chartRefreshKey}`}
                        type="user-growth-by-type"
                        chartComponent="bar"
                        showPeriodSelector={false}
                        showLegend={true}
                        legendPosition="top"
                        scope="platform"
                        height={220}
                        trendPeriod={trendPeriod}
                        onTrendPeriodChange={setTrendPeriod}
                    />
                </div>
            </div>

            {/* ── Section 4: Activity + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left 7/12 -- Platform Activity Feed */}
                <div className="col-span-12 lg:col-span-7">
                    <PlatformActivityTable
                        events={events}
                        loading={activityLoading}
                    />
                </div>

                {/* Right 5/12 -- Top Performers + Pending Actions */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <TopPerformers
                        performers={performers}
                        loading={performersLoading}
                    />
                    <PendingActionsCard
                        stats={stats}
                        loading={statsLoading}
                    />
                </div>
            </div>

            {/* ── Section 5: Distribution Charts (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left 7/12 -- User & Recruiter Breakdown */}
                <div className="col-span-12 lg:col-span-7">
                    <RecruiterStatusBreakdown
                        stats={stats}
                        loading={statsLoading}
                    />
                </div>

                {/* Right 5/12 -- Job Distribution Doughnut */}
                <div className="col-span-12 lg:col-span-5">
                    <RoleDistributionDoughnut
                        stats={stats}
                        loading={statsLoading}
                    />
                </div>
            </div>

            {/* ── Section 6: Financial Overview (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left 7/12 -- Financial Summary */}
                <div className="col-span-12 lg:col-span-7">
                    <FinancialSummaryCard
                        financials={financials}
                        loading={financialsLoading}
                    />
                </div>

                {/* Right 5/12 -- Subscription Overview */}
                <div className="col-span-12 lg:col-span-5">
                    <SubscriptionOverview
                        financials={financials}
                        loading={financialsLoading}
                    />
                </div>
            </div>
        </div>
    );
}
