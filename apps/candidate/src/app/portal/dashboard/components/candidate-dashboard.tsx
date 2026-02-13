'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePresence } from '@/hooks/use-presence';
import { useCandidateDashboardData } from '../hooks/use-candidate-dashboard-data';
import { useCandidateNotifications } from '../hooks/use-candidate-notifications';
import { useProfileCompletion } from '../hooks/use-profile-completion';
import {
    StatCard,
    StatCardGrid,
    ContentCard,
} from '@/components/ui/cards';
import { SkeletonList } from '@splits-network/shared-ui';
import { initThemeListener } from '@/components/charts/chart-options';
import ApplicationTimelineChart from '@/components/charts/application-timeline-chart';
import ApplicationStatusChart from '@/components/charts/application-status-chart';
import ActivityHeatmap from '@/components/charts/activity-heatmap';
import QuickActionsGrid from '@/components/dashboard/quick-actions-grid';
import CandidatePipeline from './candidate-pipeline';
import CandidateUrgencyBar from './candidate-urgency-bar';
import JobSearchMomentum from './job-search-momentum';
import NextStepsFeed from './next-steps-feed';

interface CandidateDashboardProps {
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

export default function CandidateDashboard({ trendPeriod, onTrendPeriodChange }: CandidateDashboardProps) {
    // Independent data hooks
    const {
        stats,
        applications,
        activeRecruiters,
        loading: dataLoading,
        error: dataError,
    } = useCandidateDashboardData();

    const {
        unreadMessages,
        unreadNotifications,
    } = useCandidateNotifications();

    const {
        profileCompletion,
        hasResume,
        loading: profileLoading,
    } = useProfileCompletion();

    // Presence for recruiter sidebar
    const recruiterUserIds = useMemo(
        () => activeRecruiters.map(r => r.recruiter_email), // presence keyed by email if no user_id
        [activeRecruiters]
    );
    const presence = usePresence(recruiterUserIds);

    // Initialize theme listener for charts
    useEffect(() => {
        initThemeListener();
    }, []);

    // Derived stats for elevation cards
    const recentActivityCount = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return applications.filter(app =>
            new Date(app.created_at) >= thirtyDaysAgo
        ).length;
    }, [applications]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Error Alert */}
            {dataError && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <div>
                        <h3 className="font-bold">Failed to load dashboard data</h3>
                        <div className="text-sm">{dataError}</div>
                    </div>
                </div>
            )}

            {/* ── Section 1: Urgency Bar (conditional) ── */}
            {!dataLoading && !profileLoading && (
                <CandidateUrgencyBar
                    applications={applications}
                    activeRecruiters={activeRecruiters}
                    unreadMessages={unreadMessages}
                    unreadNotifications={unreadNotifications}
                    profileCompletion={profileCompletion?.percentage || 100}
                    hasResume={hasResume}
                />
            )}

            {/* ── Section 2: KPI Strip (5 cards) ── */}
            <StatCardGrid className="shadow-lg w-full">
                {dataLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <StatCard key={i} title="" value={0} icon="fa-spinner" loading />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Active Applications"
                            value={stats.activeApplications}
                            description="Currently in progress"
                            icon="fa-file-lines"
                            color="primary"
                            href="/portal/applications"
                        />
                        <StatCard
                            title="Response Rate"
                            value={`${stats.responseRate}%`}
                            description="Applications advancing"
                            icon="fa-chart-line-up"
                            color="secondary"
                            href="/portal/applications"
                        />
                        <StatCard
                            title="Interviews"
                            value={stats.interviews}
                            description="In progress"
                            icon="fa-calendar-check"
                            color="success"
                            href="/portal/applications"
                        />
                        <StatCard
                            title="Offers"
                            value={stats.offers}
                            description="Received"
                            icon="fa-trophy"
                            color="warning"
                            href="/portal/applications"
                        />
                        <StatCard
                            title="Active Recruiters"
                            value={stats.active_relationships}
                            description="Working with you"
                            icon="fa-users"
                            color="info"
                            href="/portal/recruiters"
                        />
                    </>
                )}
            </StatCardGrid>

            {/* ── Section 3: Hero — Pipeline + Momentum (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                    <CandidatePipeline applications={applications} loading={dataLoading} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <JobSearchMomentum
                        recentActivityCount={recentActivityCount}
                        responseRate={stats.responseRate}
                        profileCompletion={profileCompletion?.percentage || 0}
                        activeRecruiters={stats.active_relationships}
                        loading={dataLoading || profileLoading}
                    />
                </div>
            </div>

            {/* ── Section 4: Trend Charts (3-column, elevation pattern) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Application Trends — Line chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {dataLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Application trends"
                                icon="fa-chart-line"
                                color="primary"
                                description="Total applications submitted"
                                value={stats.applications}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <ApplicationTimelineChart
                            applications={applications}
                            loading={dataLoading}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={onTrendPeriodChange}
                            compact
                        />
                    </div>
                </div>

                {/* Application Status — Doughnut chart */}
                <div className="card bg-base-200 overflow-hidden">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {dataLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Application status"
                                icon="fa-chart-pie"
                                color="success"
                                description="Currently in progress"
                                value={stats.activeApplications}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <ApplicationStatusChart
                            applications={applications}
                            loading={dataLoading}
                            compact
                        />
                    </div>
                </div>

                {/* Activity — Heatmap */}
                <div className="card bg-base-200 overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
                        {dataLoading ? (
                            <StatCard title="" value={0} icon="fa-spinner" loading />
                        ) : (
                            <StatCard
                                title="Your activity"
                                icon="fa-fire"
                                color="info"
                                description="Applications in last 30 days"
                                value={recentActivityCount}
                            />
                        )}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <ActivityHeatmap
                            applications={applications}
                            loading={dataLoading}
                            compact
                        />
                    </div>
                </div>
            </div>

            {/* ── Section 5: What's Next + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left 7/12 — What's Next Feed */}
                <div className="col-span-12 lg:col-span-7">
                    <NextStepsFeed
                        applications={applications}
                        loading={dataLoading}
                    />
                </div>

                {/* Right 5/12 — Sidebar */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* My Recruiter */}
                    <ContentCard
                        title="My Recruiter"
                        icon="fa-user-tie"
                        className="bg-base-200"
                        headerActions={
                            <Link href="/portal/recruiters" className="btn btn-sm btn-ghost text-xs">
                                View all
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                            </Link>
                        }
                    >
                        {dataLoading ? (
                            <SkeletonList count={1} variant="text-block" gap="gap-3" />
                        ) : activeRecruiters.length > 0 ? (
                            <div className="space-y-3">
                                {activeRecruiters.map((rel) => {
                                    const formatDate = (d: string) =>
                                        new Date(d).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });
                                    const expiresSoon =
                                        rel.days_until_expiry !== undefined &&
                                        rel.days_until_expiry <= 30;

                                    return (
                                        <div key={rel.id} className="flex items-center gap-3">
                                            <div className="avatar avatar-placeholder relative">
                                                <div className="bg-primary text-primary-content rounded-full w-10">
                                                    <span>
                                                        {rel.recruiter_name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">
                                                    {rel.recruiter_name}
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    Since {formatDate(rel.relationship_start_date)}
                                                </div>
                                            </div>
                                            <span
                                                className={`badge badge-sm ${expiresSoon ? 'badge-warning' : 'badge-success'}`}
                                            >
                                                {expiresSoon ? 'Expires Soon' : 'Active'}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="flex gap-2 mt-2">
                                    <Link href="/portal/messages" className="btn btn-xs btn-ghost flex-1">
                                        <i className="fa-duotone fa-regular fa-messages"></i>
                                        Message
                                    </Link>
                                    <Link href="/portal/recruiters" className="btn btn-xs btn-ghost flex-1">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                                        History
                                    </Link>
                                    <Link href="/public/marketplace" className="btn btn-xs btn-ghost flex-1">
                                        <i className="fa-duotone fa-regular fa-store"></i>
                                        Browse
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-user-tie text-xl text-base-content/30"></i>
                                </div>
                                <p className="text-sm font-medium text-base-content/60">No active recruiter</p>
                                <p className="text-xs text-base-content/40 mt-1">
                                    A recruiter can accelerate your job search
                                </p>
                                <div className="flex gap-2 mt-3 justify-center">
                                    <Link href="/portal/recruiters" className="btn btn-xs btn-ghost">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                                        History
                                    </Link>
                                    <Link href="/public/marketplace" className="btn btn-xs btn-primary">
                                        <i className="fa-duotone fa-regular fa-store"></i>
                                        Browse Marketplace
                                    </Link>
                                </div>
                            </div>
                        )}
                    </ContentCard>

                    {/* Quick Actions */}
                    <ContentCard title="Quick actions" icon="fa-bolt" className="bg-base-200">
                        <QuickActionsGrid
                            profileCompletion={profileCompletion?.percentage || 100}
                            messageCount={unreadMessages}
                            notificationCount={unreadNotifications}
                            hasResume={hasResume}
                        />
                    </ContentCard>
                </div>
            </div>
        </div>
    );
}
