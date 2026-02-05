"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { getActivityIcon, getJobStatusBadge } from "@/lib/utils";
import {
    StatCard,
    StatCardGrid,
    ContentCard,
    EmptyState,
} from "@/components/ui/cards";
import { AnalyticsChart } from "@/components/charts/analytics-chart";
import { TrendBadge } from "@/components/ui";
import RoleWizardModal from "../../roles/components/role-wizard-modal";

interface CompanyStats {
    active_roles: number;
    total_applications: number;
    interviews_scheduled: number;
    offers_extended: number;
    placements_this_month: number;
    placements_this_year: number;
    avg_time_to_hire_days: number;
    active_recruiters: number;
    trends?: {
        active_roles?: number;
        total_applications?: number;
        placements_this_month?: number;
    };
}

interface RoleBreakdown {
    id: string;
    title: string;
    location: string;
    status: string;
    applications_count: number;
    interview_count: number;
    offer_count: number;
    days_open: number;
}

interface RecentActivity {
    id: string;
    type:
        | "application_received"
        | "interview_scheduled"
        | "offer_extended"
        | "placement_completed"
        | "role_created";
    message: string;
    role_title?: string;
    timestamp: string;
    link?: string;
}

interface BillingProfileSummary {
    billing_terms: string;
    billing_email: string | null;
}

export default function CompanyDashboard() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [roleBreakdown, setRoleBreakdown] = useState<RoleBreakdown[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [allApplications, setAllApplications] = useState<any[]>([]);
    const [allJobs, setAllJobs] = useState<any[]>([]);
    const [placements, setPlacements] = useState<any[]>([]);
    const [trendPeriod, setTrendPeriod] = useState(6); // Shared trend period for all charts
    const [billingProfile, setBillingProfile] =
        useState<BillingProfileSummary | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                console.error("[Dashboard] No token available - aborting");
                return;
            }

            const api = createAuthenticatedClient(token);

            const statsResponse: any = await api.get("/stats", {
                params: {
                    scope: "company",
                },
            });

            // V2 API response format: { data: { scope, range, metrics: {...} } }
            const companyStats = statsResponse?.data?.metrics || null;
            setStats(companyStats);

            // Load role breakdown using V2 API
            // This will automatically filter to company's roles based on access context
            const rolesResponse: any = await api.get("/jobs", {
                params: {
                    status: "active",
                    limit: 100, // Get top 100 active roles
                },
            });

            const rolesData = rolesResponse.data || [];

            // Fetch applications for all roles to calculate counts
            const breakdown: RoleBreakdown[] = await Promise.all(
                rolesData.map(async (job: any) => {
                    const createdDate = new Date(job.created_at);
                    const now = new Date();
                    const daysOpen = Math.floor(
                        (now.getTime() - createdDate.getTime()) /
                            (1000 * 60 * 60 * 24),
                    );

                    // Get applications for this job to calculate stage counts
                    let applicationsCount = 0;
                    let interviewCount = 0;
                    let offerCount = 0;

                    try {
                        // Fetch all applications with pagination
                        const allApplications: any[] = [];
                        let page = 1;
                        let hasMore = true;
                        const visibleStages = [
                            "submitted",
                            "interview",
                            "offer",
                            "accepted",
                            "hired",
                        ];

                        while (hasMore) {
                            const response: any = await api.get(
                                "/applications",
                                {
                                    params: {
                                        job_id: job.id,
                                        page,
                                        limit: 100,
                                    },
                                },
                            );

                            const pageData = response.data || [];
                            // Filter to only applications in visible stages
                            const filtered = pageData.filter((app: any) =>
                                visibleStages.includes(app.stage),
                            );
                            allApplications.push(...filtered);

                            // Check if there are more pages
                            const pagination = response.pagination;
                            hasMore =
                                pagination && page < pagination.total_pages;
                            page++;
                        }

                        applicationsCount = allApplications.length;
                        interviewCount = allApplications.filter(
                            (app: any) => app.stage === "interview",
                        ).length;
                        offerCount = allApplications.filter(
                            (app: any) => app.stage === "offer",
                        ).length;
                    } catch (err) {
                        console.warn(
                            `Failed to fetch applications for job ${job.id}:`,
                            err,
                        );
                    }

                    return {
                        id: job.id,
                        title: job.title,
                        location: job.location || "Remote",
                        status: job.status,
                        applications_count: applicationsCount,
                        interview_count: interviewCount,
                        offer_count: offerCount,
                        days_open: daysOpen,
                    };
                }),
            );

            setRoleBreakdown(breakdown);

            // Load all applications for trends chart
            const allAppsResponse: any = await api.get("/applications", {
                params: {
                    limit: 1000, // Get enough data for trends
                    sort_by: "created_at",
                    sort_order: "desc",
                },
            });
            setAllApplications(allAppsResponse.data || []);

            // Store all jobs for trends chart
            setAllJobs(rolesData);

            // Load placements with application data for time-to-hire chart
            const placementsResponse: any = await api.get("/placements", {
                params: {
                    limit: 1000,
                    include: "application",
                    sort_by: "created_at",
                    sort_order: "desc",
                },
            });
            setPlacements(placementsResponse.data || []);

            // Load company billing profile (if available and user has permission)
            if (profile?.organization_ids?.length) {
                try {
                    const companiesResponse: any = await api.get("/companies", {
                        params: { limit: 50 },
                    });
                    const companies = companiesResponse?.data || [];
                    const company = companies.find(
                        (c: any) =>
                            c.identity_organization_id ===
                            profile.organization_ids[0],
                    );
                    const companyId = company?.id;
                    if (companyId) {
                        const billingResponse: any = await api.get(
                            `/company-billing-profiles/${companyId}`,
                        );
                        setBillingProfile(billingResponse?.data || null);
                    }
                } catch (billingError: any) {
                    // Billing data not available (likely insufficient permissions)
                    // This is expected for non-billing users (e.g., hiring_manager)
                    console.log("[Dashboard] Billing data not available for this user:", billingError?.response?.data?.error?.message || billingError.message);
                    setBillingProfile(null);
                }
            }

            // TODO: Load recent activity - will need a V2 endpoint
            setRecentActivity([]);
        } catch (error) {
            console.error(
                "[Dashboard] ===== ERROR IN LOAD DASHBOARD DATA =====",
            );
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

    function refresh() {
        loadDashboardData();
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section - Enhanced gradient card */}
            <div className="">
                <div className="relative p-4 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">
                                Hiring Dashboard
                            </h2>
                            <p className="text-lg opacity-90 mt-1">
                                Track your recruiting pipeline and hiring
                                performance.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-plus"></i>
                                Post Role
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Stats Grid - Using new StatCard component */}
            <div className="card bg-base-200">
                <StatCardGrid className="m-2 shadow-lg">
                    <StatCard
                        title="Active Roles"
                        value={stats?.active_roles || 0}
                        description="Open positions"
                        icon="fa-briefcase"
                        color="primary"
                        trend={stats?.trends?.active_roles}
                        href="/portal/roles"
                    />
                    <StatCard
                        title="Total Candidates"
                        value={stats?.total_applications || 0}
                        description="In pipeline"
                        icon="fa-users"
                        color="secondary"
                        trend={stats?.trends?.total_applications}
                        href="/portal/application"
                    />
                    <StatCard
                        title="Interviews"
                        value={stats?.interviews_scheduled || 0}
                        description="Scheduled"
                        icon="fa-calendar-check"
                        color="accent"
                        href="/portal/application?stage=interview"
                    />
                    <StatCard
                        title="Hires YTD"
                        value={stats?.placements_this_year || 0}
                        description="Successful placements"
                        icon="fa-trophy"
                        color="success"
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
                </div>
            </div>

            {/* Performance Metrics - Enhanced cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card bg-base-200">
                    <div className="m-2 shadow-lg rounded-xl bg-base-100">
                        <StatCard
                            title="Time to Hire"
                            icon="fa-clock"
                            color="info"
                            description="Average days to hire"
                            value={stats?.avg_time_to_hire_days || 0}
                        />
                    </div>
                    <div className="p-4 pt-0">
                        <AnalyticsChart
                            scope="company"
                            height={150}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                            type="time-to-hire-trends"
                            title={"Time to Hire Trends"}
                            chartComponent="line"
                            showLegend={true}
                            legendPosition="bottom"
                        />
                    </div>
                </div>

                <div className="card bg-base-200">
                    <div className="m-2 shadow-lg rounded-xl bg-base-100">
                        <StatCard
                            title="Recruiter Activity"
                            icon="fa-network-wired"
                            color="warning"
                            description="Active recruiters"
                            value={stats?.active_recruiters || 0}
                        />
                    </div>
                    <div className="p-4 pt-0">
                        <AnalyticsChart
                            scope="company"
                            height={150}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                            type="application-trends"
                            title={"Application Trends"}
                            chartComponent="bar"
                            showLegend={true}
                            legendPosition="bottom"
                        />
                    </div>
                </div>
                <div className="card bg-base-200">
                    <div className="m-2 shadow-lg rounded-xl bg-base-100">
                        <StatCard
                            title="Offers Extended This Month"
                            icon="fa-chart-line"
                            color="success"
                            description={
                                (stats?.offers_extended || 0) +
                                " offers extended"
                            }
                            value={stats?.trends?.placements_this_month || 0}
                        />
                    </div>
                    <div className="p-4 pt-0">
                        <AnalyticsChart
                            scope="company"
                            height={150}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                            type="recruiter-activity"
                            chartComponent="bar"
                            showLegend={true}
                            legendPosition="bottom"
                        />
                    </div>
                </div>
            </div>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Breakdown - Larger section */}
                <div className="lg:col-span-2 space-y-6">
                    <ContentCard
                        title="Active Roles Pipeline"
                        icon="fa-list-check"
                        headerActions={
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-plus"></i>
                                Post New Role
                            </button>
                        }
                        className="bg-base-200"
                    >
                        {roleBreakdown.length === 0 ? (
                            <EmptyState
                                icon="fa-briefcase"
                                title="No active roles"
                                description="Create your first role to start receiving candidates"
                                action={
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="btn btn-primary"
                                    >
                                        <i className="fa-duotone fa-regular fa-plus mr-2"></i>
                                        Create Role
                                    </button>
                                }
                            />
                        ) : (
                            <div className="overflow-x-auto -mx-4 sm:-mx-6">
                                <table className="table table-sm">
                                    <thead>
                                        <tr className="border-b border-base-200">
                                            <th className="bg-transparent">
                                                Role
                                            </th>
                                            <th className="bg-transparent text-center">
                                                Applications
                                            </th>
                                            <th className="bg-transparent text-center">
                                                Interviews
                                            </th>
                                            <th className="bg-transparent text-center">
                                                Offers
                                            </th>
                                            <th className="bg-transparent text-center">
                                                Days Open
                                            </th>
                                            <th className="bg-transparent text-center">
                                                Status
                                            </th>
                                            <th className="bg-transparent"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roleBreakdown.map((role) => (
                                            <tr
                                                key={role.id}
                                                className="hover:bg-base-200/50 transition-colors"
                                            >
                                                <td>
                                                    <div className="font-semibold text-sm">
                                                        {role.title}
                                                    </div>
                                                    <div className="text-xs text-base-content/60 flex items-center gap-1">
                                                        <i className="fa-duotone fa-regular fa-location-dot text-[10px]"></i>
                                                        {role.location}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge badge-sm badge-ghost">
                                                        {
                                                            role.applications_count
                                                        }
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge badge-sm badge-info badge-outline">
                                                        {role.interview_count}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge badge-sm badge-success badge-outline">
                                                        {role.offer_count}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className={`text-sm ${role.days_open > 60 ? "text-warning font-semibold" : "text-base-content/70"}`}
                                                    >
                                                        {role.days_open}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge badge-sm ${getJobStatusBadge(role.status)}`}
                                                    >
                                                        {role.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/portal/roles/${role.id}`}
                                                        className="btn btn-ghost btn-sm btn-square"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-chevron-right text-base-content/40"></i>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </ContentCard>

                    {/* Insights & Recommendations */}
                    {roleBreakdown.some(
                        (r) => r.days_open > 60 && r.applications_count < 5,
                    ) && (
                        <div className="alert bg-warning/10 border-warning/20 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                                <i className="fa-duotone fa-regular fa-lightbulb text-warning"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-warning">
                                    Hiring Insights
                                </h4>
                                <p className="text-sm mt-1 text-base-content/70">
                                    Some roles have been open for 60+ days with
                                    low candidate flow. Consider expanding
                                    recruiter assignments or adjusting role
                                    requirements.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Billing Summary */}
                    <ContentCard
                        title="Billing Terms"
                        icon="fa-file-invoice-dollar"
                        className="bg-base-200"
                    >
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-base-content/70">
                                    Payment Terms
                                </p>
                                <p className="font-semibold capitalize">
                                    {billingProfile?.billing_terms?.replace(
                                        "_",
                                        " ",
                                    ) || "Not set"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-base-content/70">
                                    Billing Email
                                </p>
                                <p className="font-medium">
                                    {billingProfile?.billing_email || "Not set"}
                                </p>
                            </div>
                            <Link
                                href="/portal/company/settings"
                                className="btn btn-outline w-full"
                            >
                                Manage Billing
                            </Link>
                        </div>
                    </ContentCard>

                    {/* Quick Actions - Enhanced buttons */}
                    <ContentCard
                        title="Quick Actions"
                        icon="fa-bolt"
                        className="bg-base-200"
                    >
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-plus w-4"></i>
                                Post New Role
                            </button>
                            <Link
                                href="/portal/roles"
                                className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase w-4"></i>
                                Manage Roles
                            </Link>
                            <Link
                                href="/portal/candidates"
                                className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200"
                            >
                                <i className="fa-duotone fa-regular fa-users w-4"></i>
                                View Candidates
                            </Link>
                            <Link
                                href="/portal/placements"
                                className="btn btn-outline w-full justify-start gap-3 hover:bg-base-200"
                            >
                                <i className="fa-duotone fa-regular fa-trophy w-4"></i>
                                Placements
                            </Link>
                        </div>
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
                        className="bg-base-200"
                    >
                        {recentActivity.length === 0 ? (
                            <EmptyState
                                icon="fa-inbox"
                                title="No recent activity"
                                description="Activity will appear here as candidates apply"
                                size="sm"
                            />
                        ) : (
                            <div className="space-y-1 -mx-2">
                                {recentActivity.slice(0, 6).map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-base-200/70 transition-all cursor-pointer"
                                    >
                                        <div
                                            className={`
                                            w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm
                                            ${
                                                activity.type ===
                                                "placement_completed"
                                                    ? "bg-success/10 text-success"
                                                    : activity.type ===
                                                        "offer_extended"
                                                      ? "bg-accent/10 text-accent"
                                                      : activity.type ===
                                                          "interview_scheduled"
                                                        ? "bg-info/10 text-info"
                                                        : "bg-primary/10 text-primary"
                                            }
                                        `}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${getActivityIcon(activity.type)}`}
                                            ></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2">
                                                {activity.message}
                                            </p>
                                            {activity.role_title && (
                                                <p className="text-xs text-primary mt-0.5">
                                                    {activity.role_title}
                                                </p>
                                            )}
                                            <p className="text-xs text-base-content/50 mt-0.5">
                                                {activity.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                        refresh(); // Refresh the list
                    }}
                />
            )}
        </div>
    );
}
