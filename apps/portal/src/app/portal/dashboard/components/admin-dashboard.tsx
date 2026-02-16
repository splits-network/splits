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
import { useOnlineActivity } from '../hooks/use-online-activity';
import { useDashboardRealtime } from '../hooks/use-dashboard-realtime';
import { AnalyticsChart } from '@/components/charts/analytics-chart';

import { ACCENT, accentAt } from './accent';
import {
    MemphisKpi,
    MemphisKpiStrip,
    MemphisBtn,
    MemphisTrendSelector,
} from './primitives';
import PlatformAlertsBar from './platform-alerts-bar';
import OnlineActivityChart, { type ActivitySnapshot } from './online-activity-chart';
import PlatformPipelineFunnel from './platform-pipeline-funnel';
import MarketplaceHealthRadar from './marketplace-health-radar';
import PlatformActivityTable from './platform-activity-table';
import TopPerformers from './top-performers';
import PendingActionsCard from './pending-actions-card';
import RoleDistribution from './role-distribution';
import RecruiterStatusBreakdown from './recruiter-status-breakdown';
import FinancialSummaryCard from './financial-summary-card';
import SubscriptionOverview from './subscription-overview';

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
}

export default function AdminDashboard() {
    const { userId } = useAuth();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [chartRefreshKey, setChartRefreshKey] = useState(0);

    const { stats, loading: statsLoading, refresh: refreshStats } = usePlatformStats();
    const { stages, loading: pipelineLoading, refresh: refreshPipeline } = usePlatformPipeline();
    const { health, loading: healthLoading, refresh: refreshHealth } = useMarketplaceHealth();
    const { events, loading: activityLoading, refresh: refreshActivity } = usePlatformActivity();
    const { performers, loading: performersLoading, refresh: refreshPerformers } = useTopPerformers();
    const { financials, loading: financialsLoading } = usePlatformFinancials(stats, statsLoading);
    const {
        snapshot: activitySnapshot,
        loading: activitySnapshotLoading,
        refresh: refreshActivitySnapshot,
        setSnapshot: setActivitySnapshot,
    } = useOnlineActivity();

    const handleStatsUpdate = useCallback(() => { refreshStats(); }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => { setChartRefreshKey(k => k + 1); }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshPipeline();
        refreshHealth();
        refreshActivity();
        refreshPerformers();
        refreshActivitySnapshot();
        setChartRefreshKey(k => k + 1);
    }, [refreshStats, refreshPipeline, refreshHealth, refreshActivity, refreshPerformers, refreshActivitySnapshot]);

    const handleActivityUpdate = useCallback(
        (snapshot: ActivitySnapshot) => { setActivitySnapshot(snapshot); },
        [setActivitySnapshot],
    );

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
        onActivityUpdate: handleActivityUpdate,
        extraChannels: ['dashboard:activity'],
    });

    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
            refreshActivity();
            refreshPerformers();
            refreshActivitySnapshot();
        }, 60_000);
        return () => clearInterval(interval);
    }, [refreshStats, refreshActivity, refreshPerformers, refreshActivitySnapshot]);

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                        Platform <span className="text-purple">Command Center</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40 mt-1">
                        Real-time marketplace administration
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <MemphisTrendSelector value={trendPeriod} onChange={setTrendPeriod} />
                    <MemphisBtn href="/portal/admin/recruiters" accent={ACCENT[1]} variant="outline">
                        <i className="fa-duotone fa-regular fa-user-tie" /> Recruiters
                    </MemphisBtn>
                    <MemphisBtn href="/portal/admin/payouts" accent={ACCENT[2]} variant="outline">
                        <i className="fa-duotone fa-regular fa-money-bill-transfer" /> Payouts
                    </MemphisBtn>
                    <MemphisBtn href="/portal/admin/fraud" accent={ACCENT[0]} variant="outline">
                        <i className="fa-duotone fa-regular fa-shield-exclamation" /> Fraud
                    </MemphisBtn>
                </div>
            </div>

            {/* ── Alerts ── */}
            {!statsLoading && <PlatformAlertsBar stats={stats} />}

            {/* ── Live Activity ── */}
            <OnlineActivityChart snapshot={activitySnapshot} loading={activitySnapshotLoading} />

            {/* ── KPI Strip (7 cards) ── */}
            <MemphisKpiStrip loading={statsLoading} count={7}>
                <MemphisKpi
                    label="Active jobs"
                    value={stats.active_jobs}
                    description={`${stats.total_jobs.toLocaleString()} total`}
                    icon="fa-briefcase"
                    accent={ACCENT[0]}
                    trend={stats.trends?.active_jobs}
                    href="/portal/admin/jobs"
                />
                <MemphisKpi
                    label="Recruiters"
                    value={stats.active_recruiters}
                    description={`${stats.active_companies} companies`}
                    icon="fa-user-tie"
                    accent={ACCENT[1]}
                    trend={stats.trends?.active_recruiters}
                    href="/portal/admin/recruiters"
                />
                <MemphisKpi
                    label="Candidates"
                    value={stats.total_candidates}
                    description={`${stats.new_signups_mtd} new MTD`}
                    icon="fa-id-card"
                    accent={ACCENT[3]}
                    href="/portal/admin/candidates"
                />
                <MemphisKpi
                    label="Applications"
                    value={stats.total_applications}
                    description="In pipeline"
                    icon="fa-file-lines"
                    accent={ACCENT[2]}
                    trend={stats.trends?.total_applications}
                    href="/portal/admin/applications"
                />
                <MemphisKpi
                    label="Placements YTD"
                    value={stats.total_placements}
                    description={`${stats.placements_this_month} this month`}
                    icon="fa-trophy"
                    accent={ACCENT[1]}
                    trend={stats.trends?.total_placements}
                    href="/portal/admin/placements"
                />
                <MemphisKpi
                    label="Revenue YTD"
                    value={formatCurrency(stats.total_revenue)}
                    description="Platform share"
                    icon="fa-sack-dollar"
                    accent={ACCENT[2]}
                    trend={stats.trends?.total_revenue}
                    href="/portal/admin/metrics"
                />
                <MemphisKpi
                    label="Pending payouts"
                    value={formatCurrency(stats.pending_payouts_amount)}
                    description={`${stats.pending_payouts_count} awaiting`}
                    icon="fa-money-bill-transfer"
                    accent={ACCENT[0]}
                    href="/portal/admin/payouts"
                />
            </MemphisKpiStrip>

            {/* ── Hero: Pipeline + Health (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <PlatformPipelineFunnel stages={stages} loading={pipelineLoading} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <MarketplaceHealthRadar health={health} loading={healthLoading} />
                </div>
            </div>

            {/* ── Trend Charts (3-column) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Recruiter Growth */}
                <div className="border-4 border-dark bg-base-100">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">Recruiter Growth</div>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-lg font-black tabular-nums text-dark">{stats.total_recruiters}</span>
                                    {stats.trends?.active_recruiters != null && stats.trends.active_recruiters !== 0 && (
                                        <span className={`text-xs font-bold tabular-nums ${stats.trends.active_recruiters > 0 ? 'text-teal' : 'text-coral'}`}>
                                            <i className={`fa-solid ${stats.trends.active_recruiters > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-[8px] mr-0.5`} />
                                            {Math.abs(stats.trends.active_recruiters)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <AnalyticsChart
                            key={`recruiter-growth-${chartRefreshKey}`}
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

                {/* Application Volume */}
                <div className="border-4 border-dark bg-base-100">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">Application Volume</div>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-lg font-black tabular-nums text-dark">{stats.total_applications}</span>
                                    {stats.trends?.total_applications != null && stats.trends.total_applications !== 0 && (
                                        <span className={`text-xs font-bold tabular-nums ${stats.trends.total_applications > 0 ? 'text-teal' : 'text-coral'}`}>
                                            <i className={`fa-solid ${stats.trends.total_applications > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-[8px] mr-0.5`} />
                                            {Math.abs(stats.trends.total_applications)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
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

                {/* Revenue Trend */}
                <div className="border-4 border-dark bg-base-100 md:col-span-2 lg:col-span-1">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">Revenue Trend</div>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-lg font-black tabular-nums text-dark">{formatCurrency(stats.total_revenue)}</span>
                                    {stats.trends?.total_revenue != null && stats.trends.total_revenue !== 0 && (
                                        <span className={`text-xs font-bold tabular-nums ${stats.trends.total_revenue > 0 ? 'text-teal' : 'text-coral'}`}>
                                            <i className={`fa-solid ${stats.trends.total_revenue > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-[8px] mr-0.5`} />
                                            {Math.abs(stats.trends.total_revenue)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <AnalyticsChart
                            key={`platform-revenue-${chartRefreshKey}`}
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

            {/* ── User Growth full-width ── */}
            <div className="border-4 border-dark bg-base-100">
                <div className="border-b-4 border-dark p-4">
                    {statsLoading ? (
                        <div className="h-12 bg-dark/5 animate-pulse" />
                    ) : (
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">User Growth by Type</div>
                            <div className="text-lg font-black tabular-nums text-dark mt-1">{stats.total_users}</div>
                        </div>
                    )}
                </div>
                <div className="p-4">
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

            {/* ── Activity + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <PlatformActivityTable events={events} loading={activityLoading} />
                </div>
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <TopPerformers performers={performers} loading={performersLoading} />
                    <PendingActionsCard stats={stats} loading={statsLoading} />
                </div>
            </div>

            {/* ── Distribution Charts (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <RecruiterStatusBreakdown stats={stats} loading={statsLoading} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <RoleDistribution stats={stats} loading={statsLoading} />
                </div>
            </div>

            {/* ── Financial Overview (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <FinancialSummaryCard financials={financials} loading={financialsLoading} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <SubscriptionOverview financials={financials} loading={financialsLoading} />
                </div>
            </div>
        </div>
    );
}
