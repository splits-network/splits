'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts';
import { useCompanyStats } from '../hooks/use-company-stats';
import { useCompanyActivity } from '../hooks/use-company-activity';
import { useDashboardRealtime } from '../hooks/use-dashboard-realtime';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import RoleWizardModal from '../../roles/components/modals/role-wizard-modal';

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
import CompanyUrgencyBar from './company-urgency-bar';
import HiringPipeline from './hiring-pipeline';
import CompanyHealthRadar from './company-health-radar';
import CompanyRolesTable from './company-roles-table';
import BillingSummary from './billing-summary';

const STAGE_ICONS: Record<string, string> = {
    submitted: 'fa-paper-plane',
    screen: 'fa-eye',
    interview: 'fa-comments',
    offer: 'fa-handshake',
    hired: 'fa-trophy',
    company_review: 'fa-building',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function CompanyDashboard() {
    const { userId } = useAuth();
    const { profile } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [chartRefreshKey, setChartRefreshKey] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    const { stats, loading: statsLoading, refresh: refreshStats } = useCompanyStats();
    const { activities, loading: activityLoading } = useCompanyActivity();

    const handleStatsUpdate = useCallback(() => { refreshStats(); }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => { setChartRefreshKey(k => k + 1); }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
        setChartRefreshKey(k => k + 1);
    }, [refreshStats]);

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
                        Welcome back, <span className="text-teal">{profile?.name || 'there'}</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40 mt-1">
                        Hiring pipeline &amp; performance
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <MemphisTrendSelector value={trendPeriod} onChange={setTrendPeriod} />
                    <MemphisBtn onClick={() => setShowAddModal(true)} accent={ACCENT[1]}>
                        <i className="fa-duotone fa-regular fa-plus" /> Post Role
                    </MemphisBtn>
                    <MemphisBtn href="/portal/roles" accent={ACCENT[0]} variant="outline">
                        <i className="fa-duotone fa-regular fa-briefcase" /> Manage Roles
                    </MemphisBtn>
                </div>
            </div>

            {/* ── Urgency Bar ── */}
            {!statsLoading && <CompanyUrgencyBar stats={stats} />}

            {/* ── KPI Strip (5 cards) ── */}
            <MemphisKpiStrip loading={statsLoading} count={5}>
                <MemphisKpi
                    label="Active roles"
                    value={stats.active_roles}
                    description="Open positions"
                    icon="fa-briefcase"
                    accent={ACCENT[0]}
                    trend={stats.trends?.active_roles}
                    href="/portal/roles"
                />
                <MemphisKpi
                    label="Candidates"
                    value={stats.total_applications}
                    description="Total in pipeline"
                    icon="fa-users"
                    accent={ACCENT[1]}
                    trend={stats.trends?.total_applications}
                    href="/portal/applications"
                />
                <MemphisKpi
                    label="Interviews"
                    value={stats.interviews_scheduled}
                    description="At interview stage"
                    icon="fa-calendar-check"
                    accent={ACCENT[2]}
                    href="/portal/applications?stage=interview"
                />
                <MemphisKpi
                    label="Offers"
                    value={stats.offers_extended}
                    description="Extended to candidates"
                    icon="fa-handshake"
                    accent={ACCENT[3]}
                    href="/portal/applications?stage=offer"
                />
                <MemphisKpi
                    label="Hires YTD"
                    value={stats.placements_this_year}
                    description="Successful hires"
                    icon="fa-trophy"
                    accent={ACCENT[1]}
                    trend={stats.trends?.placements_this_year}
                    href="/portal/placements"
                />
            </MemphisKpiStrip>

            {/* ── Hero: Pipeline + Health (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <HiringPipeline trendPeriod={trendPeriod} refreshKey={chartRefreshKey} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <CompanyHealthRadar refreshKey={chartRefreshKey} />
                </div>
            </div>

            {/* ── Trend Charts (3-column) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Time to Hire */}
                <div className="border-4 border-dark bg-base-100">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">Time to Hire</div>
                                <div className="text-lg font-black tabular-nums text-dark mt-1">
                                    {stats.avg_time_to_hire_days || 0}d
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <AnalyticsChart
                            key={`time-to-hire-${chartRefreshKey}`}
                            type="time-to-hire-trends"
                            chartComponent="line"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="company"
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
                                <div className="text-lg font-black tabular-nums text-dark mt-1">{stats.applications_mtd ?? 0}</div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <AnalyticsChart
                            key={`application-trends-${chartRefreshKey}`}
                            type="application-trends"
                            chartComponent="bar"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="company"
                            height={140}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>

                {/* Placement Trend */}
                <div className="border-4 border-dark bg-base-100 md:col-span-2 lg:col-span-1">
                    <div className="border-b-4 border-dark p-4">
                        {statsLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">Placement Trend</div>
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
                        <AnalyticsChart
                            key={`placement-trends-${chartRefreshKey}`}
                            type="placement-trends"
                            chartComponent="line"
                            showPeriodSelector={false}
                            showLegend={false}
                            scope="company"
                            height={140}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>
            </div>

            {/* ── Roles Table + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <CompanyRolesTable refreshKey={chartRefreshKey} onPostRole={() => setShowAddModal(true)} />
                </div>
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <BillingSummary />

                    {/* Recent Activity */}
                    <MemphisCard
                        title="Recent Activity"
                        icon="fa-clock-rotate-left"
                        accent={ACCENT[3]}
                        headerRight={
                            <MemphisBtn href="/portal/applications" accent={ACCENT[3]} variant="ghost" size="sm">
                                View All <i className="fa-duotone fa-regular fa-arrow-right" />
                            </MemphisBtn>
                        }
                    >
                        {activityLoading ? (
                            <MemphisSkeleton count={4} />
                        ) : activities.length === 0 ? (
                            <MemphisEmpty
                                icon="fa-inbox"
                                title="No recent activity"
                                description="Activity will appear here as candidates are submitted."
                            />
                        ) : (
                            <div className="space-y-1">
                                {activities.slice(0, 6).map((activity) => {
                                    const icon = STAGE_ICONS[activity.stage] || 'fa-circle';
                                    const accent = accentAt(
                                        ['submitted', 'screen'].includes(activity.stage) ? 1
                                            : activity.stage === 'interview' ? 0
                                                : activity.stage === 'offer' ? 2
                                                    : activity.stage === 'hired' ? 3 : 1
                                    );

                                    return (
                                        <Link
                                            key={activity.id}
                                            href={`/portal/applications/${activity.id}`}
                                            className="flex items-center gap-3 p-2 border-b border-dark/10 last:border-0 hover:bg-dark/5 transition-colors group"
                                        >
                                            <div className={`w-8 h-8 border-4 border-dark ${accent.bg} flex items-center justify-center shrink-0`}>
                                                <i className={`fa-duotone fa-regular ${icon} text-[10px] ${accent.textOnBg}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-dark line-clamp-1 group-hover:text-coral transition-colors">
                                                    {activity.candidate_name || 'Candidate'}
                                                </p>
                                                <p className="text-[10px] text-dark/40 line-clamp-1 mt-0.5">
                                                    {activity.job_title} &middot; <span className="capitalize">{activity.stage?.replace('_', ' ')}</span>
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold tabular-nums text-dark/30 shrink-0">
                                                {timeAgo(activity.updated_at)}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </MemphisCard>
                </div>
            </div>

            {/* Role Wizard Modal */}
            {showAddModal && (
                <RoleWizardModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        refreshStats();
                    }}
                />
            )}
        </div>
    );
}
