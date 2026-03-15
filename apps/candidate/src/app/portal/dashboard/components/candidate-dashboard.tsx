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
import { useUpcomingCalls } from "../hooks/use-upcoming-calls";
import { relationshipColor } from "./status-color";

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
        () => activeRecruiters.map((r) => r.recruiter_email),
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

    return (
        <div ref={contentRef} className="space-y-0">
            {/* ── Error Alert ── */}
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

            {/* ── Pending Invitations Banner ── */}
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

            {/* ── Job Recommendations Banner ── */}
            <RecommendationsWidget variant="banner" />

            {/* ── Urgency Bar ── */}
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

            {/* ── KPI Strip ── */}
            <section className="bg-base-200 py-4 lg:py-6 px-6 sm:px-8 lg:px-12">
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
                        color="secondary"
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
                        color="success"
                    />
                    {level ? (
                        <BaselKpiCard
                            label="Level"
                            value={`${level.current_level}`}
                            icon="fa-solid fa-star"
                            color="info"
                        />
                    ) : (
                        <BaselKpiCard
                            label="Total Apps"
                            value={loading ? "--" : stats.applications.toLocaleString()}
                            icon="fa-duotone fa-regular fa-paper-plane"
                            color="info"
                        />
                    )}
                </div>

                {/* Quick actions strip */}
                <div className="mt-3 border-t border-base-content/5 pt-2">
                    <QuickActionsGrid
                        profileCompletion={profileCompletion?.percentage || 100}
                        messageCount={unreadMessages}
                        notificationCount={unreadNotifications}
                        hasResume={hasResume}
                    />
                </div>
            </section>

            {/* ── Job Recommendations List ── */}
            <section className="bg-base-100 py-4 lg:py-6 px-6 sm:px-8 lg:px-12">
                <div className="container mx-auto">
                    <RecommendationsWidget variant="list" />
                </div>
            </section>

            {/* ── Match Preview ── */}
            <MatchPreviewWidget
                matches={topMatches}
                loading={loading}
            />

            {/* ── Upcoming Calls ── */}
            {(calls.length > 0 || callsLoading) && (
                <UpcomingCallsWidget calls={calls} loading={callsLoading} />
            )}

            {/* ── Pipeline + Momentum ── */}
            <section className="bg-base-100 py-4 lg:py-6 px-6 sm:px-8 lg:px-12 space-y-4">
                <BaselSectionHeading
                    kicker="PIPELINE"
                    title="Application Pipeline"
                    className="section-heading mb-4"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-7 scroll-reveal fade-up">
                        <BaselChartCard
                            title="Application Pipeline"
                            subtitle={`${stats.activeApplications} active · conversion funnel`}
                            accentColor="primary"
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

            {/* ── Analytics Trends ── */}
            <section className="bg-base-200 py-4 lg:py-6 px-6 sm:px-8 lg:px-12 space-y-4">
                <BaselSectionHeading
                    kicker="ANALYTICS"
                    title="Your activity trends."
                    className="section-heading mb-4"
                />

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
                            accentColor="info"
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

            {/* ── What's Next + Recruiter Sidebar ── */}
            <section className="py-4 lg:py-6 px-6 sm:px-8 lg:px-12 bg-base-100">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Feed */}
                    <div className="lg:col-span-7 scroll-reveal slide-from-left">
                        <NextStepsFeed
                            applications={applications}
                            loading={loading}
                        />
                    </div>

                    {/* Right: Recruiter */}
                    <div className="lg:col-span-5 scroll-reveal slide-from-right space-y-4">
                        <div className="bg-base-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-base-content">
                                        My Recruiter
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        Your active connections
                                    </p>
                                </div>
                                <Link href="/portal/recruiters"
                                    className="btn btn-ghost btn-sm text-primary"
                                    style={{ borderRadius: 0 }}
                                >
                                    View all
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-base-content/10 animate-pulse" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 bg-base-content/10 animate-pulse w-32" />
                                            <div className="h-2.5 bg-base-content/5 animate-pulse w-20" />
                                        </div>
                                    </div>
                                </div>
                            ) : activeRecruiters.length > 0 ? (
                                <div className="space-y-3">
                                    {activeRecruiters.map((rel) => {
                                        const formatDate = (d: string) =>
                                            new Date(d).toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                },
                                            );
                                        const expiresSoon =
                                            rel.days_until_expiry !==
                                                undefined &&
                                            rel.days_until_expiry <= 30;
                                        const statusClasses = expiresSoon
                                            ? relationshipColor("expiring")
                                            : relationshipColor("active");

                                        return (
                                            <div
                                                key={rel.id}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="text-sm font-bold text-primary">
                                                        {rel.recruiter_name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-base-content truncate">
                                                        {rel.recruiter_name}
                                                    </div>
                                                    <div className="text-sm text-base-content/40">
                                                        Since{" "}
                                                        {formatDate(
                                                            rel.relationship_start_date,
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`text-sm font-bold uppercase tracking-wider px-2 py-0.5 ${statusClasses}`}
                                                >
                                                    {expiresSoon
                                                        ? "Expires Soon"
                                                        : "Active"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex gap-2 mt-3">
                                        <Link
                                            href="/portal/messages"
                                            className="btn btn-ghost btn-sm flex-1"
                                            style={{ borderRadius: 0 }}
                                        >
                                            <i className="fa-duotone fa-regular fa-messages" />
                                            Message
                                        </Link>
                                        <Link href="/portal/recruiters"
                                            className="btn btn-ghost btn-sm flex-1"
                                            style={{ borderRadius: 0 }}
                                        >
                                            <i className="fa-duotone fa-regular fa-clock-rotate-left" />
                                            History
                                        </Link>
                                        <Link
                                            href="/marketplace"
                                            className="btn btn-ghost btn-sm flex-1"
                                            style={{ borderRadius: 0 }}
                                        >
                                            <i className="fa-duotone fa-regular fa-store" />
                                            Browse
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        <i className="fa-duotone fa-regular fa-user-tie text-xl text-primary/30" />
                                    </div>
                                    <p className="text-sm font-semibold text-base-content/60">
                                        No active recruiter
                                    </p>
                                    <p className="text-sm text-base-content/40 mt-1">
                                        A recruiter can accelerate your job
                                        search
                                    </p>
                                    <div className="flex gap-2 mt-4 justify-center">
                                        <Link href="/portal/recruiters"
                                            className="btn btn-ghost btn-sm"
                                            style={{ borderRadius: 0 }}
                                        >
                                            <i className="fa-duotone fa-regular fa-clock-rotate-left" />
                                            History
                                        </Link>
                                        <Link
                                            href="/marketplace"
                                            className="btn btn-primary btn-sm"
                                            style={{ borderRadius: 0 }}
                                        >
                                            <i className="fa-duotone fa-regular fa-store" />
                                            Browse Marketplace
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
