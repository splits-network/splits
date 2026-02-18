'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts';
import { useRecruiterStats } from '../hooks/use-recruiter-stats';
import { useTopRoles } from '../hooks/use-top-roles';
import { useDashboardRealtime } from '../hooks/use-dashboard-realtime';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { ConnectPromptBanner } from '@/components/stripe/connect-prompt-banner';
import { ConnectDrawer } from '@/components/stripe/connect-drawer';
import { Card, Badge } from '@splits-network/memphis-ui';

import { ACCENT, accentAt } from './accent';
import {
    MemphisKpi,
    MemphisKpiStrip,
    MemphisCard,
    MemphisEmpty,
    MemphisSkeleton,
    MemphisBtn,
    MemphisTrendSelector,
} from './primitives';
import UrgencyBar from './urgency-bar';
import RecruitmentFunnel from './recruitment-funnel';
import CommissionBreakdown from './commission-breakdown';
import ReputationRadar from './reputation-radar';
import PipelineActivity from './pipeline-activity';
import SubmissionHeatmap from './submission-heatmap';
import PlacementStackedBar from './placement-stacked-bar';

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

    const { stats, loading: statsLoading, refresh: refreshStats } = useRecruiterStats();
    const { roles, loading: rolesLoading, refresh: refreshRoles } = useTopRoles();

    const handleStatsUpdate = useCallback(() => { refreshStats(); }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => { setChartRefreshKey(k => k + 1); }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshRoles();
        setChartRefreshKey(k => k + 1);
    }, [refreshStats, refreshRoles]);

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
    });

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                        Welcome back, <span className="text-coral">{profile?.name || 'Recruiter'}</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40 mt-1">
                        Recruiting activity overview
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <MemphisTrendSelector value={trendPeriod} onChange={setTrendPeriod} />
                    <MemphisBtn href="/portal/roles" accent={ACCENT[0]}>
                        <i className="fa-duotone fa-regular fa-briefcase" /> Browse Roles
                    </MemphisBtn>
                    <MemphisBtn href="/portal/candidates" accent={ACCENT[1]} variant="outline">
                        <i className="fa-duotone fa-regular fa-users" /> Candidates
                    </MemphisBtn>
                </div>
            </div>

            {/* Stripe Connect banner */}
            <ConnectPromptBanner onSetUp={() => setConnectDrawerOpen(true)} />
            {connectDrawerOpen && (
                <ConnectDrawer open={connectDrawerOpen} onClose={() => setConnectDrawerOpen(false)} />
            )}

            {/* ── Urgency Bar ── */}
            {!statsLoading && <UrgencyBar stats={stats} />}

            {/* ── KPI Strip (5 cards) ── */}
            <MemphisKpiStrip loading={statsLoading} count={5}>
                <MemphisKpi
                    label="Pipeline value"
                    value={formatCurrency(stats.pipeline_value)}
                    description="Projected fees from late-stage"
                    icon="fa-sack-dollar"
                    accent={ACCENT[0]}
                    href="/portal/applications?stage=interview"
                />
                <MemphisKpi
                    label="Active roles"
                    value={stats.active_roles}
                    description="Currently working"
                    icon="fa-briefcase"
                    accent={ACCENT[1]}
                    trend={stats.trends?.active_roles}
                    href="/portal/roles"
                />
                <MemphisKpi
                    label="Submissions MTD"
                    value={stats.submissions_mtd}
                    description="Candidates submitted"
                    icon="fa-paper-plane"
                    accent={ACCENT[2]}
                    href="/portal/applications"
                />
                <MemphisKpi
                    label="Placements YTD"
                    value={stats.placements_this_year}
                    description="Successful hires"
                    icon="fa-trophy"
                    accent={ACCENT[3]}
                    trend={stats.trends?.placements_this_year}
                    href="/portal/placements"
                />
                <MemphisKpi
                    label="Commissions"
                    value={formatCurrency(stats.total_earnings_ytd)}
                    description="Split-fee earnings YTD"
                    icon="fa-coins"
                    accent={ACCENT[2]}
                    href="/portal/placements"
                />
            </MemphisKpiStrip>

            {/* ── Hero: Funnel + Commission (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <RecruitmentFunnel trendPeriod={trendPeriod} refreshKey={chartRefreshKey} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <CommissionBreakdown trendPeriod={trendPeriod} refreshKey={chartRefreshKey} />
                </div>
            </div>

            {/* ── Trend Charts (3-column) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placement trend */}
                <Card className="border-4 border-dark">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                                    Placement Trend
                                </div>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-lg font-black tabular-nums text-dark">{stats.placements_this_year}</span>
                                    {stats.trends?.placements_this_year != null && stats.trends.placements_this_year !== 0 && (
                                        <span className={`text-xs font-bold tabular-nums ${stats.trends.placements_this_year > 0 ? 'text-teal' : 'text-coral'}`}>
                                            <i className={`fa-solid ${stats.trends.placements_this_year > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-[8px] mr-0.5`} />
                                            {Math.abs(stats.trends.placements_this_year)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <PlacementStackedBar
                            key={`placement-stacked-${chartRefreshKey}`}
                            trendPeriod={trendPeriod}
                            refreshKey={chartRefreshKey}
                        />
                    </div>
                </Card>

                {/* Submission heatmap */}
                <Card className="border-4 border-dark">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                                    Submission Activity
                                </div>
                                <div className="text-lg font-black tabular-nums text-dark mt-1">
                                    {stats.submissions_mtd} <span className="text-xs text-dark/40">this month</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <SubmissionHeatmap
                            key={`submission-heatmap-${chartRefreshKey}`}
                            trendPeriod={trendPeriod}
                            refreshKey={chartRefreshKey}
                        />
                    </div>
                </Card>

                {/* Earnings trend */}
                <Card className="border-4 border-dark md:col-span-2 lg:col-span-1">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                                    Earnings Trend
                                </div>
                                <div className="text-lg font-black tabular-nums text-dark mt-1">
                                    {formatCurrency(stats.total_earnings_ytd)}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
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
                </Card>
            </div>

            {/* ── Activity + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <PipelineActivity />
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <ReputationRadar refreshKey={chartRefreshKey} />

                    {/* Top Roles */}
                    <MemphisCard
                        title="Top Roles"
                        icon="fa-fire"
                        accent={ACCENT[2]}
                        headerRight={
                            <MemphisBtn href="/portal/roles" accent={ACCENT[2]} variant="ghost" size="sm">
                                View All <i className="fa-duotone fa-regular fa-arrow-right" />
                            </MemphisBtn>
                        }
                    >
                        {rolesLoading ? (
                            <MemphisSkeleton count={3} />
                        ) : roles.length === 0 ? (
                            <MemphisEmpty
                                icon="fa-briefcase"
                                title="No active roles"
                                description="Browse the marketplace to find roles and start submitting candidates."
                            />
                        ) : (
                            <div className="space-y-2">
                                {roles.slice(0, 5).map((role, i) => {
                                    const accent = accentAt(i);
                                    return (
                                        <Link
                                            key={role.id}
                                            href={`/portal/roles/${role.id}`}
                                            className="flex items-center gap-3 p-3 border-b border-dark/10 last:border-0 hover:bg-dark/5 transition-colors group"
                                        >
                                            <div className={`w-6 h-6 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                                <span className={`text-[8px] font-black ${accent.textOnBg}`}>{i + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-dark line-clamp-1 group-hover:text-coral transition-colors">
                                                    {role.title}
                                                </div>
                                                <div className="text-[10px] text-dark/40 flex items-center gap-1.5 mt-0.5">
                                                    <i className="fa-duotone fa-regular fa-building text-[8px]" />
                                                    <span className="line-clamp-1">{role.company?.name}</span>
                                                    {role.location && (
                                                        <>
                                                            <span className="text-dark/20">&bull;</span>
                                                            <span className="line-clamp-1">{role.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {(role.candidate_count ?? 0) > 0 && (
                                                <Badge color="teal" size="xs">
                                                    {role.candidate_count}
                                                </Badge>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </MemphisCard>
                </div>
            </div>
        </div>
    );
}
