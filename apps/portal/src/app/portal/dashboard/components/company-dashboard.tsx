'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts';
import { useCompanyStats } from '../hooks/use-company-stats';
import { useCompanyActivity } from '../hooks/use-company-activity';
import { useDashboardRealtime } from '../hooks/use-dashboard-realtime';
import {
    StatCard,
    StatCardGrid,
    ContentCard,
    EmptyState,
} from '@/components/ui/cards';
import { AnalyticsChart } from '@/components/charts/analytics-chart';
import { PageTitle } from '@/components/page-title';
import { TrendPeriodSelector } from '@/components/charts/trend-period-selector';
import HiringPipeline from './hiring-pipeline';
import CompanyHealthRadar from './company-health-radar';
import CompanyUrgencyBar from './company-urgency-bar';
import CompanyRolesTable from './company-roles-table';
import BillingSummary from './billing-summary';
import RoleWizardModal from '../../roles/components/modals/role-wizard-modal';
import { SkeletonList } from '@splits-network/shared-ui';

const STAGE_ICONS: Record<string, string> = {
    submitted: 'fa-paper-plane',
    screen: 'fa-eye',
    interview: 'fa-comments',
    offer: 'fa-handshake',
    hired: 'fa-trophy',
    company_review: 'fa-building',
};

const STAGE_COLORS: Record<string, string> = {
    submitted: 'bg-primary/10 text-primary',
    screen: 'bg-info/10 text-info',
    interview: 'bg-accent/10 text-accent',
    offer: 'bg-warning/10 text-warning',
    hired: 'bg-success/10 text-success',
    company_review: 'bg-secondary/10 text-secondary',
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export default function CompanyDashboard() {
    const { userId } = useAuth();
    const { profile } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [chartRefreshKey, setChartRefreshKey] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    // Independent data hooks
    const { stats, loading: statsLoading, refresh: refreshStats } = useCompanyStats();
    const { activities, loading: activityLoading } = useCompanyActivity();

    // Real-time WebSocket updates
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);

    const handleChartsUpdate = useCallback(() => {
        setChartRefreshKey(k => k + 1);
    }, []);

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
        <div className="space-y-8 animate-fade-in">
            <PageTitle
                title={`Welcome back, ${profile?.name || 'there'}!`}
                subtitle="Track your recruiting pipeline and hiring performance."
            >
                <TrendPeriodSelector
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
                <div className="hidden lg:block w-px h-6 bg-base-300" />
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-plus w-3.5"></i>
                    Post Role
                </button>
                <Link href="/portal/roles" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-briefcase w-3.5"></i>
                    Manage Roles
                </Link>
                <Link href="/portal/candidates" className="btn btn-ghost btn-sm gap-2">
                    <i className="fa-duotone fa-regular fa-users w-3.5"></i>
                    Candidates
                </Link>
            </PageTitle>

            {/* ── Section 0: Urgency Bar (conditional) ── */}
            {!statsLoading && <CompanyUrgencyBar stats={stats} />}

            {/* ── Section 1: KPI Strip (5 cards) ── */}
            <StatCardGrid className="shadow-lg w-full">
                {statsLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <StatCard key={i} title="" value={0} icon="fa-spinner" loading />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Active roles"
                            value={stats.active_roles}
                            description="Open positions accepting candidates"
                            icon="fa-briefcase"
                            color="primary"
                            trend={stats.trends?.active_roles}
                            href="/portal/roles"
                        />
                        <StatCard
                            title="Candidates"
                            value={stats.total_applications}
                            description="Total candidates in pipeline"
                            icon="fa-users"
                            color="secondary"
                            trend={stats.trends?.total_applications}
                            href="/portal/applications"
                        />
                        <StatCard
                            title="Interviews"
                            value={stats.interviews_scheduled}
                            description="Candidates at interview stage"
                            icon="fa-calendar-check"
                            color="accent"
                            href="/portal/applications?stage=interview"
                        />
                        <StatCard
                            title="Offers"
                            value={stats.offers_extended}
                            description="Offers extended to candidates"
                            icon="fa-handshake"
                            color="warning"
                            href="/portal/applications?stage=offer"
                        />
                        <StatCard
                            title="Hires YTD"
                            value={stats.placements_this_year}
                            description="Successful hires this year"
                            icon="fa-trophy"
                            color="success"
                            trend={stats.trends?.placements_this_year}
                            href="/portal/placements"
                        />
                    </>
                )}
            </StatCardGrid>

            {/* ── Section 2: Hero — Asymmetric 7/5 split ── */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                    <HiringPipeline trendPeriod={trendPeriod} refreshKey={chartRefreshKey} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <CompanyHealthRadar refreshKey={chartRefreshKey} />
                </div>
            </div>

            {/* ── Section 3: Trend Charts (3-column, elevation pattern) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Time to Hire — Line chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Time to hire"
                                icon="fa-clock"
                                color="info"
                                description="Average days from application to hire"
                                value={`${stats.avg_time_to_hire_days || 0}d`}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
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

                {/* Application Volume — Bar chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Application volume"
                                icon="fa-inbox"
                                color="secondary"
                                description="Applications received this month"
                                value={stats.applications_mtd ?? 0}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
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

                {/* Placement Rate — Line chart with area fill */}
                <div className="card bg-base-200 overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {statsLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
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

            {/* ── Section 4: Activity + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left 7/12 — Roles Pipeline Table */}
                <div className="col-span-12 lg:col-span-7">
                    <CompanyRolesTable
                        refreshKey={chartRefreshKey}
                        onPostRole={() => setShowAddModal(true)}
                    />
                </div>

                {/* Right 5/12 — Billing + Activity */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Billing Summary */}
                    <BillingSummary />

                    {/* Recent Activity */}
                    <ContentCard
                        title="Recent activity"
                        icon="fa-clock-rotate-left"
                        className="bg-base-200"
                        headerActions={
                            <Link href="/portal/applications" className="btn btn-sm btn-ghost text-xs">
                                View all
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                            </Link>
                        }
                    >
                        {activityLoading ? (
                            <SkeletonList count={4} variant="text-block" gap="gap-3" />
                        ) : activities.length === 0 ? (
                            <EmptyState
                                icon="fa-inbox"
                                title="No recent activity"
                                description="Activity will appear here as candidates are submitted to your roles."
                                size="sm"
                            />
                        ) : (
                            <div className="space-y-1 -mx-2">
                                {activities.slice(0, 6).map((activity) => {
                                    const icon = STAGE_ICONS[activity.stage] || 'fa-circle';
                                    const colorClasses = STAGE_COLORS[activity.stage] || 'bg-base-300/10 text-base-content/60';

                                    return (
                                        <Link
                                            key={activity.id}
                                            href={`/portal/applications/${activity.id}`}
                                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-base-300/50 transition-all group"
                                        >
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm ${colorClasses}`}>
                                                <i className={`fa-duotone fa-regular ${icon}`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                                    {activity.candidate_name || 'Candidate'}
                                                </p>
                                                <p className="text-xs text-base-content/60 line-clamp-1 mt-0.5">
                                                    {activity.job_title} &middot; <span className="capitalize">{activity.stage?.replace('_', ' ')}</span>
                                                </p>
                                                <p className="text-xs text-base-content/40 mt-0.5 tabular-nums">
                                                    {timeAgo(activity.updated_at)}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </ContentCard>
                </div>
            </div>

            {/* Add Role Modal */}
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
