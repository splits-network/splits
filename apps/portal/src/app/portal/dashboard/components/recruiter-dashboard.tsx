"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import ActionableProposalsWidget from "./actionable-proposals-widget";
import { getActivityIcon } from "@/lib/utils";
import {
    StatCard,
    StatCardGrid,
    ContentCard,
    EmptyState,
} from "@/components/ui/cards";
import { TrendBadge } from "@/components/ui";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import { ConnectPromptBanner } from "@/components/stripe/connect-prompt-banner";
import { ConnectDrawer } from "@/components/stripe/connect-drawer";

interface RecruiterStats {
    active_roles: number;
    candidates_in_process: number;
    offers_pending: number;
    placements_this_month: number;
    placements_this_year: number;
    total_earnings_ytd: number;
    pending_payouts: number;
    // Trend data (percentage change from previous period)
    trends?: {
        active_roles?: number;
        candidates_in_process?: number;
        placements_this_month?: number;
        placements_this_year?: number;
    };
}

interface RecentActivity {
    id: string;
    type:
        | "application_submitted"
        | "stage_changed"
        | "offer_extended"
        | "placement_created";
    message: string;
    job_title?: string;
    candidate_name?: string;
    timestamp: string;
    link?: string;
}

const ACTIVITY_TYPE_BY_STAGE: Record<string, RecentActivity["type"]> = {
    draft: "application_submitted",
    screen: "application_submitted",
    submitted: "stage_changed",
    interview: "stage_changed",
    offer: "offer_extended",
    hired: "placement_created",
    rejected: "stage_changed",
};

const STAGE_MESSAGE: Record<string, string> = {
    draft: "started a draft application",
    screen: "needs your review",
    submitted: "was submitted to the company",
    interview: "moved to interview stage",
    offer: "has an offer pending",
    hired: "was marked as hired",
    rejected: "was rejected",
};

const formatActivityTimestamp = (value?: string) => {
    const date = value ? new Date(value) : new Date();
    return date.toLocaleString();
};

const mapApplicationToActivity = (application: any): RecentActivity => {
    const stage = application.stage || "submitted";
    const candidateName =
        application.candidate?.full_name || "Unknown Candidate";
    const jobTitle = application.job?.title;
    const messageSuffix = STAGE_MESSAGE[stage] || "was updated";

    return {
        id: application.id,
        type: ACTIVITY_TYPE_BY_STAGE[stage] || "stage_changed",
        message: `${candidateName} ${messageSuffix}${jobTitle ? ` for ${jobTitle}` : ""}`,
        job_title: jobTitle,
        candidate_name: candidateName,
        timestamp: formatActivityTimestamp(
            application.updated_at || application.created_at,
        ),
        link: `/portal/applications/${application.id}`,
    };
};

export default function RecruiterDashboard() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const [stats, setStats] = useState<RecruiterStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [topRoles, setTopRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [trendPeriod, setTrendPeriod] = useState(6); // Shared trend period for all charts
    const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            // Load recruiter stats using V2 analytics endpoint
            const statsResponse: any = await api.get("/stats", {
                params: {
                    scope: "recruiter",
                    range: "ytd",
                },
            });
            const recruiterStats =
                statsResponse?.data?.metrics ||
                statsResponse?.data ||
                statsResponse ||
                null;

            setStats(
                recruiterStats || {
                    active_roles: 0,
                    candidates_in_process: 0,
                    offers_pending: 0,
                    placements_this_month: 0,
                    placements_this_year: 0,
                    total_earnings_ytd: 0,
                    pending_payouts: 0,
                },
            );

            // Load recent activity from latest applications
            const activityResponse: any = await api.get("/applications", {
                params: {
                    limit: 8,
                    sort_by: "updated_at",
                    sort_order: "desc",
                },
            });

            const applications =
                activityResponse?.data || activityResponse || [];
            setRecentActivity(
                Array.isArray(applications)
                    ? applications.map(mapApplicationToActivity)
                    : [],
            );

            // Load top active roles
            const rolesResponse: any = await api.get("/jobs", {
                params: {
                    status: "active",
                    limit: 5,
                },
            });

            setTopRoles(rolesResponse.data || rolesResponse || []);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Welcome skeleton */}
                <div className="h-28 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 skeleton"></div>
                {/* Stats skeleton */}
                <StatCardGrid>
                    {[1, 2, 3, 4].map((i) => (
                        <StatCard
                            key={i}
                            title=""
                            value={0}
                            icon="fa-spinner"
                            loading
                        />
                    ))}
                </StatCardGrid>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <ConnectPromptBanner onSetUp={() => setConnectDrawerOpen(true)} />
            <ConnectDrawer
                open={connectDrawerOpen}
                onClose={() => setConnectDrawerOpen(false)}
            />

            {/* Key Stats Grid - Using new StatCard component */}
            <div className="card bg-base-200">
                <StatCardGrid className="m-2">
                    <StatCard
                        title="Active Roles"
                        value={stats?.active_roles || 0}
                        description="Roles assigned to you"
                        icon="fa-briefcase"
                        color="primary"
                        trend={stats?.trends?.active_roles}
                        href="/portal/roles"
                    />
                    <StatCard
                        title="In Process"
                        value={stats?.candidates_in_process || 0}
                        description="Active candidates"
                        icon="fa-users"
                        color="secondary"
                        trend={stats?.trends?.candidates_in_process}
                        href="/portal/applications"
                    />
                    <StatCard
                        title="Pending Offers"
                        value={stats?.offers_pending || 0}
                        description="Awaiting acceptance"
                        icon="fa-file-contract"
                        color="accent"
                        href="/portal/applications?stage=offer"
                    />
                    <StatCard
                        title="Placements YTD"
                        value={stats?.placements_this_year || 0}
                        description="Successful hires"
                        icon="fa-trophy"
                        color="success"
                        trend={stats?.trends?.placements_this_year}
                        href="/portal/placements"
                    />
                </StatCardGrid>
                <div className="p-4 pt-0">
                    <AnalyticsChart
                        type="placement-trends"
                        title="Placement Trends"
                        chartComponent="line"
                        showLegend={true}
                        legendPosition="bottom"
                        scope="company"
                        height={200}
                        trendPeriod={trendPeriod}
                        onTrendPeriodChange={setTrendPeriod}
                    />
                    <div className="alert alert-info alert-outline">
                        <i className="fa-duotone fa-regular fa-info-circle text-base-content/40"></i>
                        <span className="text-sm text-base-content/70">
                            This is an example of integrating an analytics chart
                            into the dashboard.
                        </span>
                    </div>
                </div>
            </div>

            {/* Earnings Overview - Enhanced cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContentCard
                    title="Earnings This Year"
                    icon="fa-chart-line"
                    headerActions={
                        <Link
                            href="/portal/placements"
                            className="btn btn-sm btn-ghost text-success"
                        >
                            View Details
                            <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                        </Link>
                    }
                >
                    <div className="flex items-baseline gap-3 mt-2">
                        <div className="text-4xl font-bold text-success">
                            $
                            {((stats?.total_earnings_ytd || 0) / 1000).toFixed(
                                1,
                            )}
                            k
                        </div>
                        {stats?.trends?.placements_this_year && (
                            <TrendBadge
                                value={stats.trends.placements_this_year}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-base-200">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-calendar-check text-success"></i>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/60">
                                    This Month
                                </div>
                                <div className="text-lg font-semibold">
                                    {stats?.placements_this_month || 0}{" "}
                                    placements
                                </div>
                            </div>
                        </div>
                    </div>
                </ContentCard>

                <ContentCard
                    title="Pending Payouts"
                    icon="fa-money-bill-transfer"
                    headerActions={
                        <Link
                            href="/earnings"
                            className="btn btn-sm btn-ghost text-primary"
                        >
                            View Payouts
                            <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                        </Link>
                    }
                >
                    <div className="flex items-baseline gap-3 mt-2">
                        <div className="text-4xl font-bold text-primary">
                            ${((stats?.pending_payouts || 0) / 1000).toFixed(1)}
                            k
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200">
                        <i className="fa-duotone fa-regular fa-info-circle text-base-content/40"></i>
                        <span className="text-sm text-base-content/60">
                            Payments processed after guarantee period
                        </span>
                    </div>
                </ContentCard>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Proposals + Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Actionable Proposals */}
                    <ContentCard
                        title="Action Required"
                        subtitle="Review and submit these applications to the hiring companies."
                        icon="fa-inbox"
                        headerActions={
                            <Link
                                href="/portal/applications"
                                className="btn btn-sm btn-ghost"
                            >
                                View all applications
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                            </Link>
                        }
                    >
                        <ActionableProposalsWidget compact={true} />
                    </ContentCard>

                    {/* Recent Activity - Enhanced styling */}
                    <ContentCard
                        title="Recent Activity"
                        icon="fa-clock-rotate-left"
                        headerActions={
                            recentActivity.length > 5 && (
                                <Link
                                    href="/activity"
                                    className="btn btn-sm btn-ghost"
                                >
                                    View all
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                </Link>
                            )
                        }
                    >
                        {recentActivity.length === 0 ? (
                            <EmptyState
                                icon="fa-inbox"
                                title="No recent activity"
                                description="Start by submitting candidates to active roles"
                                size="sm"
                            />
                        ) : (
                            <div className="space-y-1 -mx-2">
                                {recentActivity.slice(0, 8).map((activity) => (
                                    <Link
                                        key={activity.id}
                                        href={activity.link || "#"}
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-base-200/70 transition-all group"
                                    >
                                        <div
                                            className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                            ${
                                                activity.type ===
                                                "placement_created"
                                                    ? "bg-success/10 text-success"
                                                    : activity.type ===
                                                        "offer_extended"
                                                      ? "bg-accent/10 text-accent"
                                                      : activity.type ===
                                                          "application_submitted"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-secondary/10 text-secondary"
                                            }
                                        `}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${getActivityIcon(activity.type)}`}
                                            ></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm line-clamp-1">
                                                {activity.message}
                                            </p>
                                            {activity.job_title && (
                                                <p className="text-xs text-primary mt-0.5">
                                                    {activity.job_title}
                                                </p>
                                            )}
                                            <p className="text-xs text-base-content/50 mt-0.5">
                                                {activity.timestamp}
                                            </p>
                                        </div>
                                        <i className="fa-duotone fa-regular fa-chevron-right text-base-content/30 group-hover:text-primary transition-colors"></i>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </ContentCard>
                </div>

                {/* Right Column - Quick Actions & Top Roles */}
                <div className="space-y-6">
                    {/* Quick Actions - Enhanced buttons */}
                    <ContentCard title="Quick Actions" icon="fa-bolt">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/portal/roles"
                                className="btn btn-primary w-full justify-start gap-3"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase w-4"></i>
                                Browse Roles
                            </Link>
                            <Link
                                href="/portal/candidates"
                                className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200"
                            >
                                <i className="fa-duotone fa-regular fa-users w-4"></i>
                                My Candidates
                            </Link>
                            <Link
                                href="/portal/proposals"
                                className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200"
                            >
                                <i className="fa-duotone fa-regular fa-inbox w-4"></i>
                                Proposals
                            </Link>
                            <Link
                                href="/portal/placements"
                                className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200"
                            >
                                <i className="fa-duotone fa-regular fa-trophy w-4"></i>
                                My Placements
                            </Link>
                        </div>
                    </ContentCard>

                    {/* Top Active Roles - Enhanced list */}
                    <ContentCard
                        title="Top Active Roles"
                        icon="fa-fire"
                        headerActions={
                            <Link
                                href="/portal/roles"
                                className="btn btn-sm btn-ghost"
                            >
                                All roles
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                            </Link>
                        }
                    >
                        {topRoles.length === 0 ? (
                            <EmptyState
                                icon="fa-briefcase"
                                title="No active roles"
                                description="Check back soon for new opportunities"
                                size="sm"
                            />
                        ) : (
                            <div className="space-y-2 -mx-2">
                                {topRoles.slice(0, 5).map((role) => (
                                    <Link
                                        key={role.id}
                                        href={`/portal/roles/${role.id}`}
                                        className="block p-3 rounded-xl hover:bg-base-200/70 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
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
                                                            <span className="text-base-content/30">
                                                                •
                                                            </span>
                                                            <span className="line-clamp-1">
                                                                {role.location}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {role.candidate_count > 0 && (
                                                <span className="badge badge-sm badge-primary badge-outline shrink-0">
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

            {/* Getting Started Tips - Enhanced alert */}
            {(stats?.active_roles === 0 ||
                stats?.candidates_in_process === 0) && (
                <div className="alert bg-info/10 border-info/20 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center shrink-0">
                        <i className="fa-duotone fa-regular fa-lightbulb text-info"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-info">
                            Getting Started Tips
                        </h4>
                        <div className="text-sm mt-1 text-base-content/70">
                            {stats?.active_roles === 0 && (
                                <p>
                                    • Browse available roles and start
                                    submitting qualified candidates
                                </p>
                            )}
                            {stats?.candidates_in_process === 0 &&
                                stats?.active_roles > 0 && (
                                    <p>
                                        • You have {stats.active_roles} active
                                        role
                                        {stats.active_roles !== 1 ? "s" : ""} -
                                        submit your first candidate to get
                                        started!
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
