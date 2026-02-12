"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { useRecruiterStats } from "../hooks/use-recruiter-stats";
import { useTopRoles } from "../hooks/use-top-roles";
import { useDashboardRealtime } from "../hooks/use-dashboard-realtime";
import {
    StatCard,
    StatCardGrid,
    ContentCard,
    EmptyState,
} from "@/components/ui/cards";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import { PageTitle } from "@/components/page-title";
import { TrendPeriodSelector } from "@/components/charts/trend-period-selector";
import { ConnectPromptBanner } from "@/components/stripe/connect-prompt-banner";
import { ConnectDrawer } from "@/components/stripe/connect-drawer";
import PipelineActivity from "./pipeline-activity";
import RecruitmentFunnel from "./recruitment-funnel";
import CommissionBreakdown from "./commission-breakdown";
import ReputationRadar from "./reputation-radar";
import UrgencyBar from "./urgency-bar";
import SubmissionHeatmap from "./submission-heatmap";
import PlacementStackedBar from "./placement-stacked-bar";
import { SkeletonList } from "@splits-network/shared-ui";

function formatCurrency(value: number): string {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
}

export default function RecruiterDashboard() {
    const { userId } = useAuth();
    const { profile } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
    const [chartRefreshKey, setChartRefreshKey] = useState(0);

    // Independent data hooks
    const {
        stats,
        loading: statsLoading,
        refresh: refreshStats,
    } = useRecruiterStats();
    const {
        roles,
        loading: rolesLoading,
        refresh: refreshRoles,
    } = useTopRoles();

    // Real-time WebSocket updates
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);

    const handleChartsUpdate = useCallback(() => {
        setChartRefreshKey((k) => k + 1);
    }, []);

    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshRoles();
        setChartRefreshKey((k) => k + 1);
    }, [refreshStats, refreshRoles]);

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <PageTitle
                title={`Welcome back, ${profile?.name || 'Recruiter'}!`}
                subtitle="Here's an overview of your recruiting activity."
            >
                <TrendPeriodSelector
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
                <div className="hidden lg:block w-px h-6 bg-base-300" />
                <Link href="/portal/roles" className="btn btn-primary btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-briefcase w-3.5"></i>
                    Browse Roles
                </Link>
                <Link href="/portal/candidates" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-users w-3.5"></i>
                    Candidates
                </Link>
                <Link href="/portal/applications" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-inbox w-3.5"></i>
                    Applications
                </Link>
                <Link href="/portal/placements" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-trophy w-3.5"></i>
                    Placements
                </Link>
            </PageTitle>

            {/* Stripe Connect banner */}
            <ConnectPromptBanner onSetUp={() => setConnectDrawerOpen(true)} />
            {connectDrawerOpen && (
                <ConnectDrawer
                    open={connectDrawerOpen}
                    onClose={() => setConnectDrawerOpen(false)}
                />
            )}

            {/* ── Section 0: Urgency Bar (conditional) ── */}
            {!statsLoading && <UrgencyBar stats={stats} />}

            {/* ── Section 1: KPI Strip (5 cards) ── */}
            <StatCardGrid className="shadow-lg w-full">
                {statsLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <StatCard
                            key={i}
                            title=""
                            value={0}
                            icon="fa-spinner"
                            loading
                        />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Pipeline value"
                            value={formatCurrency(stats.pipeline_value)}
                            description="Projected fees from late-stage candidates"
                            icon="fa-sack-dollar"
                            color="primary"
                            href="/portal/applications?stage=interview"
                        />
                        <StatCard
                            title="Active roles"
                            value={stats.active_roles}
                            description="Roles you are currently working"
                            icon="fa-briefcase"
                            color="info"
                            trend={stats.trends?.active_roles}
                            href="/portal/roles"
                        />
                        <StatCard
                            title="Submissions this month"
                            value={stats.submissions_mtd}
                            description="Candidates submitted to open roles"
                            icon="fa-paper-plane"
                            color="secondary"
                            href="/portal/applications"
                        />
                        <StatCard
                            title="Placements this year"
                            value={stats.placements_this_year}
                            description="Successful hires placed year to date"
                            icon="fa-trophy"
                            color="success"
                            trend={stats.trends?.placements_this_year}
                            href="/portal/placements"
                        />
                        <StatCard
                            title="Commissions earned"
                            value={formatCurrency(stats.total_earnings_ytd)}
                            description="Split-fee commissions year to date"
                            icon="fa-coins"
                            color="warning"
                            href="/portal/placements"
                        />
                    </>
                )}
            </StatCardGrid>

            {/* ── Section 2: Hero — Asymmetric 7/5 split ── */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                    <RecruitmentFunnel
                        trendPeriod={trendPeriod}
                        refreshKey={chartRefreshKey}
                    />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <CommissionBreakdown
                        trendPeriod={trendPeriod}
                        refreshKey={chartRefreshKey}
                    />
                </div>
            </div>

            {/* ── Section 3: Trend Charts (3-column, elevation pattern) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placements -- Stacked bar chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard
                                title=""
                                value={0}
                                icon="fa-spinner"
                                loading
                            />
                        ) : (
                            <StatCard
                                title="Placement trend"
                                icon="fa-trophy"
                                color="success"
                                description="Successful placements year to date"
                                value={stats.placements_this_year}
                                trend={stats.trends?.placements_this_year}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <PlacementStackedBar
                            key={`placement-stacked-${chartRefreshKey}`}
                            trendPeriod={trendPeriod}
                            refreshKey={chartRefreshKey}
                            height={140}
                        />
                    </div>
                </div>

                {/* Submissions -- Heatmap */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard
                                title=""
                                value={0}
                                icon="fa-spinner"
                                loading
                            />
                        ) : (
                            <StatCard
                                title="Submission trend"
                                icon="fa-paper-plane"
                                color="info"
                                description="Candidates submitted this month"
                                value={stats.submissions_mtd}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <SubmissionHeatmap
                            key={`submission-heatmap-${chartRefreshKey}`}
                            trendPeriod={trendPeriod}
                            refreshKey={chartRefreshKey}
                        />
                    </div>
                </div>

                {/* Earnings -- Line chart with area fill */}
                <div className="card bg-base-200 overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard
                                title=""
                                value={0}
                                icon="fa-spinner"
                                loading
                            />
                        ) : (
                            <StatCard
                                title="Earnings trend"
                                icon="fa-sack-dollar"
                                color="warning"
                                description="Commission earnings year to date"
                                value={formatCurrency(stats.total_earnings_ytd)}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <AnalyticsChart
                            key={`earnings-trends-${chartRefreshKey}`}
                            type="earnings-trends"
                            chartComponent="line"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="recruiter"
                            height={140}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>
            </div>

            {/* ── Section 4: Activity + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left 7/12 -- Pipeline Activity */}
                <div className="col-span-12 lg:col-span-7">
                    <PipelineActivity />
                </div>

                {/* Right 5/12 -- Reputation Radar + Top Roles */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <ReputationRadar refreshKey={chartRefreshKey} />

                    {/* Top Roles */}
                    <ContentCard
                        title="Top roles"
                        icon="fa-fire"
                        className="bg-base-200"
                        headerActions={
                            <Link
                                href="/portal/roles"
                                className="btn btn-sm btn-ghost text-xs"
                            >
                                View All Roles
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                            </Link>
                        }
                    >
                        {rolesLoading ? (
                            <SkeletonList
                                count={3}
                                variant="text-block"
                                gap="gap-3"
                            />
                        ) : roles.length === 0 ? (
                            <EmptyState
                                icon="fa-briefcase"
                                title="No active roles"
                                description="Browse the marketplace to find roles and start submitting candidates."
                                size="sm"
                            />
                        ) : (
                            <div className="space-y-1 -mx-2">
                                {roles.slice(0, 5).map((role) => (
                                    <Link
                                        key={role.id}
                                        href={`/portal/roles/${role.id}`}
                                        className="block p-3 rounded-xl hover:bg-base-300/50 transition-all duration-150 group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                    {role.title}
                                                </div>
                                                <div className="text-xs text-base-content/60 flex items-center gap-1.5 mt-1">
                                                    <i className="fa-duotone fa-regular fa-building text-[10px]"></i>
                                                    <span className="line-clamp-1">
                                                        {role.company?.name}
                                                    </span>
                                                    {role.location && (
                                                        <>
                                                            <span className="text-base-content/20 select-none">
                                                                &bull;
                                                            </span>
                                                            <span className="line-clamp-1">
                                                                {role.location}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {(role.candidate_count ?? 0) >
                                                0 && (
                                                <span className="badge badge-sm badge-primary badge-outline shrink-0 tabular-nums">
                                                    {role.candidate_count}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </ContentCard>
                </div>
            </div>
        </div>
    );
}
