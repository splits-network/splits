"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";
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
    console.log("Recruiter User IDs for presence tracking:", recruiterUserIds);
    const presence = usePresence(recruiterUserIds);

    const contentRef = useRef<HTMLDivElement>(null);

    /* ── Scroll-reveal animations ── */
    useScrollReveal(contentRef);

    const recentActivityCount = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return applications.filter(
            (app) => new Date(app.created_at) >= thirtyDaysAgo,
        ).length;
    }, [applications]);

    /* ── KPI data ── */
    // Static class names so Tailwind can detect them at build time
    const kpis = [
        {
            label: "Active Applications",
            value: stats.activeApplications,
            icon: "fa-duotone fa-regular fa-file-lines",
            borderClass: "border-primary",
            bgClass: "bg-primary/10",
            textClass: "text-primary",
            href: "/portal/applications",
            description: "Currently in progress",
        },
        {
            label: "Response Rate",
            value: `${stats.responseRate}%`,
            icon: "fa-duotone fa-regular fa-chart-line-up",
            borderClass: "border-secondary",
            bgClass: "bg-secondary/10",
            textClass: "text-secondary",
            href: "/portal/applications",
            description: "Applications advancing",
        },
        {
            label: "Interviews",
            value: stats.interviews,
            icon: "fa-duotone fa-regular fa-calendar-check",
            borderClass: "border-warning",
            bgClass: "bg-warning/10",
            textClass: "text-warning",
            href: "/portal/applications",
            description: "In progress",
        },
        {
            label: "Offers",
            value: stats.offers,
            icon: "fa-duotone fa-regular fa-trophy",
            borderClass: "border-accent",
            bgClass: "bg-accent/10",
            textClass: "text-accent",
            href: "/portal/applications",
            description: "Received",
        },
        {
            label: "Active Recruiters",
            value: stats.active_relationships,
            icon: "fa-duotone fa-regular fa-users",
            borderClass: "border-success",
            bgClass: "bg-success/10",
            textClass: "text-success",
            href: "/portal/recruiters",
            description: "Working with you",
        },
        ...(level
            ? [
                  {
                      label: "Level",
                      value: `${level.current_level}`,
                      icon: "fa-solid fa-star",
                      borderClass: "border-info",
                      bgClass: "bg-info/10",
                      textClass: "text-info",
                      href: "/portal/profile?section=achievements",
                      description: level.title,
                  },
              ]
            : []),
    ];

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
            {!dataLoading && pendingInvitations.length > 0 && (
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

            {/* ── Section 1: Urgency Bar ── */}
            {!dataLoading && !profileLoading && (
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

            {/* ── Section 2: KPI Strip ── */}
            <section className="bg-base-200 py-10">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    {dataLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-base-100 border-t-4 border-base-content/10 p-6"
                                >
                                    <div className="w-10 h-10 bg-base-content/10 animate-pulse mb-3" />
                                    <div className="h-3 w-16 bg-base-content/10 animate-pulse mb-2" />
                                    <div className="h-8 w-20 bg-base-content/10 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {kpis.map((kpi, i) => {
                                const content = (
                                    <div
                                        className={`kpi-card scroll-reveal fade-up bg-base-100 border-t-4 ${kpi.borderClass} p-6 group transition-transform ${kpi.href ? "hover:-translate-y-0.5" : ""}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className={`w-10 h-10 ${kpi.bgClass} flex items-center justify-center`}
                                            >
                                                <i
                                                    className={`${kpi.icon} text-lg ${kpi.textClass}`}
                                                />
                                            </div>
                                            {kpi.href && (
                                                <i className="fa-duotone fa-regular fa-arrow-right text-sm text-base-content/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </div>
                                        <div className="text-2xl md:text-3xl font-black tracking-tight text-base-content tabular-nums">
                                            {kpi.value}
                                        </div>
                                        <div className="text-xs uppercase tracking-wider text-base-content/50 mt-1">
                                            {kpi.label}
                                        </div>
                                        {kpi.description && (
                                            <div className="text-sm text-base-content/30 mt-1">
                                                {kpi.description}
                                            </div>
                                        )}
                                    </div>
                                );
                                return kpi.href ? (
                                    <Link
                                        key={i}
                                        href={kpi.href}
                                        className="block"
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={i}>{content}</div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Section 2b: Match Preview ── */}
            <MatchPreviewWidget
                matches={topMatches}
                loading={dataLoading}
            />

            {/* ── Section 2c: Upcoming Calls ── */}
            {(calls.length > 0 || callsLoading) && (
                <UpcomingCallsWidget calls={calls} loading={callsLoading} />
            )}

            {/* ── Section 3: Pipeline + Momentum (7/5) ── */}
            <section className="py-12 bg-base-100">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 chart-card scroll-reveal fade-up">
                            <CandidatePipelineChart
                                applications={applications}
                                loading={dataLoading}
                            />
                        </div>
                        <div className="lg:col-span-5 chart-card scroll-reveal fade-up">
                            <JobSearchMomentumChart
                                recentActivityCount={recentActivityCount}
                                responseRate={stats.responseRate}
                                profileCompletion={
                                    profileCompletion?.percentage || 0
                                }
                                activeRecruiters={stats.active_relationships}
                                loading={dataLoading || profileLoading}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 4: Trend Charts (3-column) ── */}
            <section className="py-12 bg-base-200">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="mb-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                            Analytics
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-base-content">
                            Your activity trends.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Application Trends */}
                        <div className="chart-card scroll-reveal fade-up bg-base-100 p-8 lg:col-span-1">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Application Trends
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        {stats.applications} total
                                    </p>
                                </div>
                            </div>
                            <ApplicationTimelineChart
                                applications={applications}
                                loading={dataLoading}
                                trendPeriod={trendPeriod}
                                onTrendPeriodChange={onTrendPeriodChange}
                                compact
                            />
                        </div>

                        {/* Application Status */}
                        <div className="chart-card scroll-reveal fade-up bg-base-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Application Status
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        {stats.activeApplications} active
                                    </p>
                                </div>
                            </div>
                            <ApplicationStatusChart
                                applications={applications}
                                loading={dataLoading}
                                compact
                            />
                        </div>

                        {/* Activity Heatmap */}
                        <div className="chart-card scroll-reveal fade-up bg-base-100 p-8 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Your Activity
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        {recentActivityCount} last 30 days
                                    </p>
                                </div>
                            </div>
                            <ActivityHeatmap
                                applications={applications}
                                loading={dataLoading}
                                compact
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 5: What's Next + Recruiter Sidebar (7/5) ── */}
            <section className="py-12 bg-base-100">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Feed */}
                        <div className="lg:col-span-7 feed-panel scroll-reveal slide-from-left">
                            <NextStepsFeed
                                applications={applications}
                                loading={dataLoading}
                            />
                        </div>

                        {/* Right: Recruiter + Quick Actions */}
                        <div className="lg:col-span-5 sidebar-panel scroll-reveal slide-from-right space-y-8">
                            {/* My Recruiter Card */}
                            <div className="bg-base-200 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-base-content">
                                            My Recruiter
                                        </h3>
                                        <p className="text-sm text-base-content/50">
                                            Your active connections
                                        </p>
                                    </div>
                                    <Link
                                        href="/portal/recruiters"
                                        className="btn btn-ghost btn-sm text-primary"
                                        style={{ borderRadius: 0 }}
                                    >
                                        View all
                                        <i className="fa-duotone fa-regular fa-arrow-right" />
                                    </Link>
                                </div>

                                {dataLoading ? (
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
                                            <Link
                                                href="/portal/recruiters"
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
                                        <p className="text-xs text-base-content/40 mt-1">
                                            A recruiter can accelerate your job
                                            search
                                        </p>
                                        <div className="flex gap-2 mt-4 justify-center">
                                            <Link
                                                href="/portal/recruiters"
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
                </div>
            </section>

            {/* ── Section 6: Quick Actions (full-width, since no sidebar) ── */}
            <section className="py-12 bg-base-200">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-3">
                            Quick Access
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-base-content">
                            Everything you need.
                        </h2>
                    </div>
                    <QuickActionsGrid
                        profileCompletion={profileCompletion?.percentage || 100}
                        messageCount={unreadMessages}
                        notificationCount={unreadNotifications}
                        hasResume={hasResume}
                    />
                </div>
            </section>
        </div>
    );
}
