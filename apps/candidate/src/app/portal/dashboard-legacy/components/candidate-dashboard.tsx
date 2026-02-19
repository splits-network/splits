'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePresence } from '@/hooks/use-presence';
import { useCandidateDashboardData } from '../hooks/use-candidate-dashboard-data';
import { useCandidateNotifications } from '../hooks/use-candidate-notifications';
import { useProfileCompletion } from '../hooks/use-profile-completion';
import { Card, Badge, AlertBanner, Button } from '@splits-network/memphis-ui';
import { initThemeListener } from '@/components/charts/chart-options';
import ApplicationTimelineChart from '@/components/charts/application-timeline-chart';
import ApplicationStatusChart from '@/components/charts/application-status-chart';
import ActivityHeatmap from '@/components/charts/activity-heatmap';
import QuickActionsGrid from '@/components/dashboard/quick-actions-grid';
import CandidatePipeline from './candidate-pipeline';
import CandidateUrgencyBar from './candidate-urgency-bar';
import JobSearchMomentum from './job-search-momentum';
import NextStepsFeed from './next-steps-feed';

import { ACCENT, accentAt } from './accent';
import {
    MemphisKpi,
    MemphisKpiStrip,
    MemphisCard,
    MemphisEmpty,
    MemphisSkeleton,
    MemphisBtn,
} from './primitives';

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
        <div className="space-y-6">
            {/* Error Alert */}
            {dataError && (
                <AlertBanner type="error">
                    <span className="font-bold">Failed to load dashboard data</span>
                    <span className="text-sm ml-2">{dataError}</span>
                </AlertBanner>
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
            <MemphisKpiStrip loading={dataLoading} count={5}>
                <MemphisKpi
                    label="Active Applications"
                    value={stats.activeApplications}
                    description="Currently in progress"
                    icon="fa-file-lines"
                    accent={ACCENT[0]}
                    href="/portal/applications"
                />
                <MemphisKpi
                    label="Response Rate"
                    value={`${stats.responseRate}%`}
                    description="Applications advancing"
                    icon="fa-chart-line-up"
                    accent={ACCENT[1]}
                    href="/portal/applications"
                />
                <MemphisKpi
                    label="Interviews"
                    value={stats.interviews}
                    description="In progress"
                    icon="fa-calendar-check"
                    accent={ACCENT[2]}
                    href="/portal/applications"
                />
                <MemphisKpi
                    label="Offers"
                    value={stats.offers}
                    description="Received"
                    icon="fa-trophy"
                    accent={ACCENT[3]}
                    href="/portal/applications"
                />
                <MemphisKpi
                    label="Active Recruiters"
                    value={stats.active_relationships}
                    description="Working with you"
                    icon="fa-users"
                    accent={ACCENT[1]}
                    href="/portal/recruiters"
                />
            </MemphisKpiStrip>

            {/* ── Section 3: Hero — Pipeline + Momentum (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
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

            {/* ── Section 4: Trend Charts (3-column) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Application Trends — Line chart */}
                <Card className="border-4 border-dark">
                    <div className="border-b-4 border-dark p-4">
                        {dataLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                                    Application Trends
                                </div>
                                <div className="text-lg font-black tabular-nums text-dark mt-1">
                                    {stats.applications} <span className="text-xs text-dark/40">total</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <ApplicationTimelineChart
                            applications={applications}
                            loading={dataLoading}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={onTrendPeriodChange}
                            compact
                        />
                    </div>
                </Card>

                {/* Application Status — Doughnut chart */}
                <Card className="border-4 border-dark">
                    <div className="border-b-4 border-dark p-4">
                        {dataLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                                    Application Status
                                </div>
                                <div className="text-lg font-black tabular-nums text-dark mt-1">
                                    {stats.activeApplications} <span className="text-xs text-dark/40">active</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <ApplicationStatusChart
                            applications={applications}
                            loading={dataLoading}
                            compact
                        />
                    </div>
                </Card>

                {/* Activity — Heatmap */}
                <Card className="border-4 border-dark md:col-span-2 lg:col-span-1">
                    <div className="border-b-4 border-dark p-4">
                        {dataLoading ? (
                            <div className="h-12 bg-dark/5 animate-pulse" />
                        ) : (
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                                    Your Activity
                                </div>
                                <div className="text-lg font-black tabular-nums text-dark mt-1">
                                    {recentActivityCount} <span className="text-xs text-dark/40">last 30 days</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <ActivityHeatmap
                            applications={applications}
                            loading={dataLoading}
                            compact
                        />
                    </div>
                </Card>
            </div>

            {/* ── Section 5: What's Next + Sidebar (7/5 split) ── */}
            <div className="grid grid-cols-12 gap-4">
                {/* Left 7/12 — What's Next Feed */}
                <div className="col-span-12 lg:col-span-7">
                    <NextStepsFeed
                        applications={applications}
                        loading={dataLoading}
                    />
                </div>

                {/* Right 5/12 — Sidebar */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    {/* My Recruiter */}
                    <MemphisCard
                        title="My Recruiter"
                        icon="fa-user-tie"
                        accent={ACCENT[1]}
                        headerRight={
                            <MemphisBtn href="/portal/recruiters" accent={ACCENT[1]} variant="ghost" size="sm">
                                View all <i className="fa-duotone fa-regular fa-arrow-right" />
                            </MemphisBtn>
                        }
                    >
                        {dataLoading ? (
                            <MemphisSkeleton count={1} />
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
                                            {/* Memphis avatar — sharp square, accent bg */}
                                            <div className="w-10 h-10 border-4 border-dark bg-teal flex items-center justify-center shrink-0">
                                                <span className="text-sm font-black text-dark">
                                                    {rel.recruiter_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-dark truncate">
                                                    {rel.recruiter_name}
                                                </div>
                                                <div className="text-[10px] text-dark/40">
                                                    Since {formatDate(rel.relationship_start_date)}
                                                </div>
                                            </div>
                                            <Badge
                                                color={expiresSoon ? 'yellow' : 'teal'}
                                                size="xs"
                                            >
                                                {expiresSoon ? 'Expires Soon' : 'Active'}
                                            </Badge>
                                        </div>
                                    );
                                })}
                                <div className="flex gap-2 mt-2">
                                    <MemphisBtn href="/portal/messages" accent={ACCENT[1]} variant="ghost" size="sm" className="flex-1">
                                        <i className="fa-duotone fa-regular fa-messages"></i>
                                        Message
                                    </MemphisBtn>
                                    <MemphisBtn href="/portal/recruiters" accent={ACCENT[3]} variant="ghost" size="sm" className="flex-1">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                                        History
                                    </MemphisBtn>
                                    <MemphisBtn href="/public/marketplace" accent={ACCENT[0]} variant="ghost" size="sm" className="flex-1">
                                        <i className="fa-duotone fa-regular fa-store"></i>
                                        Browse
                                    </MemphisBtn>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 border-4 border-dark bg-teal/10 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-user-tie text-xl text-dark/30"></i>
                                </div>
                                <p className="text-sm font-bold text-dark/60">No active recruiter</p>
                                <p className="text-[10px] text-dark/40 mt-1">
                                    A recruiter can accelerate your job search
                                </p>
                                <div className="flex gap-2 mt-3 justify-center">
                                    <MemphisBtn href="/portal/recruiters" accent={ACCENT[1]} variant="ghost" size="sm">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left"></i>
                                        History
                                    </MemphisBtn>
                                    <MemphisBtn href="/public/marketplace" accent={ACCENT[0]} size="sm">
                                        <i className="fa-duotone fa-regular fa-store"></i>
                                        Browse Marketplace
                                    </MemphisBtn>
                                </div>
                            </div>
                        )}
                    </MemphisCard>

                    {/* Quick Actions */}
                    <MemphisCard title="Quick Actions" icon="fa-bolt" accent={ACCENT[2]}>
                        <QuickActionsGrid
                            profileCompletion={profileCompletion?.percentage || 100}
                            messageCount={unreadMessages}
                            notificationCount={unreadNotifications}
                            hasResume={hasResume}
                        />
                    </MemphisCard>
                </div>
            </div>
        </div>
    );
}
