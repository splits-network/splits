"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    useScrollReveal,
    BaselChartCard,
    BaselKpiCard,
    BaselSectionHeading,
} from "@splits-network/basel-ui";
import { usePresence } from "@/hooks/use-presence";
import { useUserProfile } from "@/contexts";
import { ApiClient } from "@/lib/api-client";
import type { EntityLevelInfo } from "@splits-network/shared-gamification";
import { useCandidateDashboardData } from "../hooks/use-candidate-dashboard-data";
import { useCandidateNotifications } from "../hooks/use-candidate-notifications";
import { useProfileCompletion } from "../hooks/use-profile-completion";
import ApplicationTimelineChart from "./charts/application-timeline-chart";
import ApplicationStatusChart from "./charts/application-status-chart";
import ActivityHeatmap from "./charts/activity-heatmap";
import CandidatePipelineChart from "./charts/candidate-pipeline-chart";
import JobSearchMomentumChart from "./charts/job-search-momentum-chart";
import CandidateUrgencyBar from "./candidate-urgency-bar";
import NextStepsFeed from "./next-steps-feed";
import QuickActionsGrid from "./quick-actions-grid";
import MatchPreviewWidget from "./match-preview-widget";
import RecommendationsWidget from "./recommendations-widget";
import UpcomingCallsWidget from "./upcoming-calls-widget";
import { RecruiterCard } from "./recruiter-card";
import { useUpcomingCalls } from "../hooks/use-upcoming-calls";
import { relationshipColor } from "./status-color";

/* Standard section padding — every section uses this */
const SECTION = "py-8 lg:py-12 px-6 sm:px-8 lg:px-12";

const PERIODS = [
    { label: "3M", value: 3 },
    { label: "6M", value: 6 },
    { label: "1Y", value: 12 },
    { label: "2Y", value: 24 },
];

interface CandidateDashboardProps {
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

export default function CandidateDashboard({
    trendPeriod,
    onTrendPeriodChange,
}: CandidateDashboardProps) {
    const {
        stats,
        applications,
        activeRecruiters,
        pendingInvitations,
        topMatches,
        loading: dataLoading,
        error: dataError,
    } = useCandidateDashboardData();

    const { calls, loading: callsLoading } = useUpcomingCalls();
    const { unreadMessages, unreadNotifications } = useCandidateNotifications();

    const {
        profileCompletion,
        hasResume,
        hasPrimaryResume,
        loading: profileLoading,
    } = useProfileCompletion();

    const { profile } = useUserProfile();
    const candidateId = profile?.candidate_id;
    const [level, setLevel] = useState<EntityLevelInfo | null>(null);

    useEffect(() => {
        if (!candidateId) return;
        const client = new ApiClient();
        client
            .get<{ data: EntityLevelInfo }>("/xp/level", {
                params: { entity_type: "candidate", entity_id: candidateId },
            })
            .then((res) => setLevel(res.data))
            .catch(() => {});
    }, [candidateId]);

    const recruiterUserIds = useMemo(
        () => activeRecruiters.map((r) => r.recruiter_user_id),
        [activeRecruiters],
    );
    const presence = usePresence(recruiterUserIds);

    const contentRef = useRef<HTMLDivElement>(null);
    useScrollReveal(contentRef);

    const recentActivityCount = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return applications.filter(
            (app) => new Date(app.created_at) >= thirtyDaysAgo,
        ).length;
    }, [applications]);

    const loading = dataLoading;
    const hasCalls = calls.length > 0 || callsLoading;

    return (
        <div ref={contentRef}>
            {/* ── Banners (thin, no section padding) ── */}
            {dataError && (
                <div className="bg-error/5 border-l-4 border-error px-6 sm:px-8 lg:px-12 py-4">
                    <div className="container mx-auto flex items-start sm:items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5 sm:mt-0 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-error">
                                Failed to load dashboard data
                            </p>
                            <p className="text-sm text-error/70 mt-0.5 break-words">
                                {dataError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!loading && pendingInvitations.length > 0 && (
                <div className="bg-primary/5 border-l-4 border-primary px-6 sm:px-8 lg:px-12 py-4">
                    <div className="container mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <i className="fa-duotone fa-regular fa-envelope-open-text text-primary text-lg shrink-0 hidden sm:block" />
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <i className="fa-duotone fa-regular fa-envelope-open-text text-primary text-lg shrink-0 sm:hidden mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-base-content">
                                    {pendingInvitations.length === 1
                                        ? `${pendingInvitations[0].recruiter_name} has invited you to work together`
                                        : `You have ${pendingInvitations.length} pending recruiter invitations`}
                                </p>
                                <p className="text-sm text-base-content/60 mt-0.5">
                                    Review and respond to get started with your
                                    recruiter
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            {pendingInvitations.slice(0, 2).map((inv) => (
                                <Link
                                    key={inv.id}
                                    href={`/portal/invitation/${inv.invitation_token}`}
                                    className="btn btn-primary btn-sm flex-1 sm:flex-initial"
                                >
                                    {pendingInvitations.length === 1
                                        ? "Review Invitation"
                                        : inv.recruiter_name?.split(" ")[0] ||
                                          "Review"}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <RecommendationsWidget variant="banner" />

            {!loading && !profileLoading && (
                <CandidateUrgencyBar
                    applications={applications}
                    activeRecruiters={activeRecruiters}
                    unreadMessages={unreadMessages}
                    unreadNotifications={unreadNotifications}
                    profileCompletion={profileCompletion?.percentage || 100}
                    hasResume={hasResume}
                    hasPrimaryResume={hasPrimaryResume}
                />
            )}

            {/* ─── Section 1: KPIs + Quick Actions (base-200) ─── */}
            <section className={`bg-base-200 ${SECTION}`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <BaselKpiCard
                        label="Active Applications"
                        value={loading ? "--" : stats.activeApplications.toLocaleString()}
                        icon="fa-duotone fa-regular fa-file-lines"
                        color="primary"
                    />
                    <BaselKpiCard
                        label="Response Rate"
                        value={loading ? "--" : `${stats.responseRate}%`}
                        icon="fa-duotone fa-regular fa-chart-line-up"
                        color="info"
                    />
                    <BaselKpiCard
                        label="Interviews"
                        value={loading ? "--" : stats.interviews.toLocaleString()}
                        icon="fa-duotone fa-regular fa-calendar-check"
                        color="warning"
                    />
                    <BaselKpiCard
                        label="Offers"
                        value={loading ? "--" : stats.offers.toLocaleString()}
                        icon="fa-duotone fa-regular fa-trophy"
                        color="accent"
                    />
                    <BaselKpiCard
                        label="Active Recruiters"
                        value={loading ? "--" : stats.active_relationships.toLocaleString()}
                        icon="fa-duotone fa-regular fa-users"
                        color="secondary"
                    />
                    {level ? (
                        <BaselKpiCard
                            label="Level"
                            value={`${level.current_level}`}
                            icon="fa-solid fa-star"
                            color="success"
                        />
                    ) : (
                        <BaselKpiCard
                            label="Total Apps"
                            value={loading ? "--" : stats.applications.toLocaleString()}
                            icon="fa-duotone fa-regular fa-paper-plane"
                            color="primary"
                        />
                    )}
                </div>

                <div className="mt-4 border-t border-base-content/5 pt-3">
                    <QuickActionsGrid
                        profileCompletion={profileCompletion?.percentage || 100}
                        messageCount={unreadMessages}
                        notificationCount={unreadNotifications}
                        hasResume={hasResume}
                    />
                </div>
            </section>

            {/* ─── Section 2: Recruiter + What's Next (base-100) ─── */}
            <section className={`bg-base-100 ${SECTION}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 scroll-reveal fade-up">
                        <RecruiterCard
                            activeRecruiters={activeRecruiters}
                            pendingInvitations={pendingInvitations}
                            presence={presence}
                            loading={loading}
                        />
                    </div>
                    <div className="lg:col-span-7 scroll-reveal fade-up">
                        <NextStepsFeed
                            applications={applications}
                            loading={loading}
                        />
                    </div>
                </div>
            </section>

            {/* ─── Section 3: Calls + Recommendations (base-200) ─── */}
            <section className={`bg-base-200 ${SECTION} space-y-8`}>
                {hasCalls && (
                    <UpcomingCallsWidget calls={calls} loading={callsLoading} />
                )}
                <RecommendationsWidget variant="list" />
            </section>

            {/* ─── Section 4: Matches (base-100) ─── */}
            <section className={`bg-base-100 ${SECTION}`}>
                <MatchPreviewWidget
                    matches={topMatches}
                    loading={loading}
                />
            </section>

            {/* ─── Section 5: Pipeline + Momentum (base-200) ─── */}
            <section className={`bg-base-200 ${SECTION} space-y-6`}>
                <BaselSectionHeading
                    kicker="PIPELINE"
                    title="Application Pipeline"
                    className="section-heading"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-7 scroll-reveal fade-up">
                        <BaselChartCard
                            title="Application Pipeline"
                            subtitle={`${stats.activeApplications} active · conversion funnel`}
                            accentColor="info"
                            compact
                            className="h-full"
                        >
                            <CandidatePipelineChart
                                applications={applications}
                                loading={loading}
                            />
                        </BaselChartCard>
                    </div>
                    <div className="lg:col-span-5 scroll-reveal fade-up">
                        <BaselChartCard
                            title="Job Search Momentum"
                            subtitle="Your search health score"
                            icon="fa-duotone fa-regular fa-gauge-high"
                            accentColor="secondary"
                            compact
                            className="h-full"
                        >
                            <JobSearchMomentumChart
                                recentActivityCount={recentActivityCount}
                                responseRate={stats.responseRate}
                                profileCompletion={
                                    profileCompletion?.percentage || 0
                                }
                                activeRecruiters={stats.active_relationships}
                                loading={loading || profileLoading}
                            />
                        </BaselChartCard>
                    </div>
                </div>
            </section>

            {/* ─── Section 6: Analytics (base-100) ─── */}
            <section className={`bg-base-100 ${SECTION} space-y-6`}>
                <div className="flex items-end justify-between">
                    <BaselSectionHeading
                        kicker="ANALYTICS"
                        title="Your activity trends"
                        className="section-heading"
                    />
                    <div className="flex gap-1 bg-base-200 p-1">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => onTrendPeriodChange(p.value)}
                                className={`btn btn-sm ${
                                    trendPeriod === p.value
                                        ? "btn-primary"
                                        : "btn-ghost"
                                }`}
                                style={{ borderRadius: 0 }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="scroll-reveal fade-up">
                        <BaselChartCard
                            title="Application Trends"
                            subtitle={`${stats.applications} total`}
                            accentColor="primary"
                            compact
                            className="h-full"
                        >
                            <ApplicationTimelineChart
                                applications={applications}
                                loading={loading}
                                trendPeriod={trendPeriod}
                                onTrendPeriodChange={onTrendPeriodChange}
                                compact
                            />
                        </BaselChartCard>
                    </div>

                    <div className="scroll-reveal fade-up">
                        <BaselChartCard
                            title="Application Status"
                            subtitle={`${stats.activeApplications} active`}
                            accentColor="accent"
                            compact
                            className="h-full"
                        >
                            <ApplicationStatusChart
                                applications={applications}
                                loading={loading}
                                compact
                            />
                        </BaselChartCard>
                    </div>

                    <div className="md:col-span-2 lg:col-span-1 scroll-reveal fade-up">
                        <BaselChartCard
                            title="Your Activity"
                            subtitle={`${recentActivityCount} last 30 days`}
                            accentColor="success"
                            compact
                            className="h-full"
                        >
                            <ActivityHeatmap
                                applications={applications}
                                loading={loading}
                                compact
                            />
                        </BaselChartCard>
                    </div>
                </div>
            </section>
        </div>
    );
}

