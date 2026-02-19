"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RoleWizardModal from "@/app/portal/roles/components/modals/role-wizard-modal";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { useCompanyStats } from "@/app/portal/dashboard/hooks/use-company-stats";
import { useHiringPipeline } from "@/app/portal/dashboard/hooks/use-hiring-pipeline";
import { useCompanyHealth } from "@/app/portal/dashboard/hooks/use-company-health";
import { useRoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";
import type { RoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";
import { useCompanyActivity } from "@/app/portal/dashboard/hooks/use-company-activity";
import type { CompanyActivity } from "@/app/portal/dashboard/hooks/use-company-activity";
import { useDashboardRealtime } from "@/app/portal/dashboard/hooks/use-dashboard-realtime";
import {
    BaselKpiCard,
    BaselChartCard,
    BaselSectionHeading,
    BaselSidebarCard,
    BaselStatusPill,
} from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { PeriodSelector } from "@/components/basel/dashboard/shared/period-selector";
import { KpiGrid } from "@/components/basel/dashboard/shared/kpi-grid";
import { BaselAnimator } from "@/app/portal/dashboard/basel-animator";

/* ── Lazy-loaded chart components ──────────────────────────────────────────── */

const PipelineFunnelChart = dynamic(
    () =>
        import("@/components/basel/dashboard/charts/pipeline-funnel-chart").then(
            (m) => ({ default: m.PipelineFunnelChart }),
        ),
    { loading: () => <ChartLoadingState height={200} /> },
);

const ApplicationVolumeChart = dynamic(
    () =>
        import("@/components/basel/dashboard/charts/application-volume-chart").then(
            (m) => ({ default: m.ApplicationVolumeChart }),
        ),
    { loading: () => <ChartLoadingState height={200} /> },
);

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function formatTrend(value: number | undefined): {
    trend?: string;
    trendUp?: boolean;
} {
    if (value === undefined || value === null || value === 0) return {};
    return {
        trend: `${value > 0 ? "+" : ""}${value}%`,
        trendUp: value > 0,
    };
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const STAGE_ICONS: Record<string, { icon: string; color: string; bg: string }> =
    {
        submitted: {
            icon: "fa-duotone fa-regular fa-paper-plane",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        screen: {
            icon: "fa-duotone fa-regular fa-eye",
            color: "text-info",
            bg: "bg-info/10",
        },
        interview: {
            icon: "fa-duotone fa-regular fa-comments",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        offer: {
            icon: "fa-duotone fa-regular fa-handshake",
            color: "text-warning",
            bg: "bg-warning/10",
        },
        hired: {
            icon: "fa-duotone fa-regular fa-trophy",
            color: "text-success",
            bg: "bg-success/10",
        },
        company_review: {
            icon: "fa-duotone fa-regular fa-building",
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
    };

const DEFAULT_STAGE = {
    icon: "fa-duotone fa-regular fa-circle",
    color: "text-primary",
    bg: "bg-primary/10",
};

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info"> =
    {
        active: "success",
        closed: "error",
        expired: "warning",
        draft: "info",
    };

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function CompanyView() {
    const { userId } = useAuth();
    const { profile } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    /* Data hooks */
    const {
        stats,
        loading: statsLoading,
        refresh: refreshStats,
    } = useCompanyStats();
    const { stages, loading: pipelineLoading } = useHiringPipeline(trendPeriod);
    const { metrics: healthMetrics, loading: healthLoading } =
        useCompanyHealth();
    const { roles, loading: rolesLoading } = useRoleBreakdown();
    const { activities, loading: activityLoading } = useCompanyActivity();

    /* Realtime */
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => {
        /* hooks refetch on their own */
    }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
    }, [refreshStats]);

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
    });

    /* Health labels for display */
    const healthLabels = [
        { key: "timeToFill", label: "Time to Fill" },
        { key: "candidateFlow", label: "Candidate Flow" },
        { key: "interviewRate", label: "Interview Rate" },
        { key: "offerRate", label: "Offer Rate" },
        { key: "fillRate", label: "Fill Rate" },
    ] as const;

    return (
        <div className="min-h-screen bg-base-100">
            <BaselAnimator>
                {/* ── SECTION 1: Header ── */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="section-heading">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                HIRING OVERVIEW
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-base-content">
                                {profile?.name || "Company"} Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <PeriodSelector
                                value={trendPeriod}
                                onChange={setTrendPeriod}
                            />
                            <button
                                onClick={() => setIsRoleModalOpen(true)}
                                className="btn btn-primary btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-plus" />{" "}
                                Post Role
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 2: KPIs ── */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <KpiGrid cols={4}>
                        <BaselKpiCard
                            label="Active Roles"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.active_roles.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-briefcase"
                            color="primary"
                            {...formatTrend(stats.trends?.active_roles)}
                        />
                        <BaselKpiCard
                            label="Total Candidates"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.total_applications.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-users"
                            color="secondary"
                            {...formatTrend(stats.trends?.total_applications)}
                        />
                        <BaselKpiCard
                            label="Interviews Scheduled"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.interviews_scheduled.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-calendar-check"
                            color="accent"
                        />
                        <BaselKpiCard
                            label="Offers Extended"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.offers_extended.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-handshake"
                            color="info"
                        />
                        <BaselKpiCard
                            label="Hires YTD"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.placements_this_year.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-trophy"
                            color="success"
                            {...formatTrend(stats.trends?.placements_this_year)}
                        />
                        <BaselKpiCard
                            label="Avg Days to Hire"
                            value={
                                statsLoading
                                    ? "--"
                                    : `${stats.avg_time_to_hire_days}d`
                            }
                            icon="fa-duotone fa-regular fa-stopwatch"
                            color="warning"
                        />
                        <BaselKpiCard
                            label="Active Recruiters"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.active_recruiters.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-user-tie"
                            color="primary"
                        />
                        <BaselKpiCard
                            label="Roles Stalled"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.stale_roles.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-clock"
                            color="error"
                        />
                    </KpiGrid>
                </section>

                {/* ── SECTION 3: Charts ── */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <BaselSectionHeading
                        kicker="ANALYTICS"
                        title="Hiring Performance"
                        className="section-heading mb-4"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Hiring Pipeline Funnel */}
                        <BaselChartCard
                            title="Hiring Funnel"
                            subtitle="Candidates by pipeline stage"
                            accentColor="primary"
                            className="lg:col-span-2"
                        >
                            <PipelineFunnelChart
                                stages={stages}
                                loading={pipelineLoading}
                                height={200}
                            />
                        </BaselChartCard>

                        {/* Time to Hire / Company Health */}
                        <BaselChartCard
                            title="Hiring Health"
                            subtitle="Efficiency across five metrics"
                            accentColor="secondary"
                        >
                            {healthLoading ? (
                                <ChartLoadingState height={200} />
                            ) : (
                                <div className="space-y-3">
                                    {healthLabels.map(({ key, label }) => {
                                        const val =
                                            healthMetrics[
                                                key as keyof typeof healthMetrics
                                            ] || 0;
                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="text-xs text-base-content/60 w-28 shrink-0 truncate">
                                                    {label}
                                                </span>
                                                <div className="flex-1 h-2 bg-base-300">
                                                    <div
                                                        className="h-full bg-secondary"
                                                        style={{
                                                            width: `${val}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold tabular-nums w-8 text-right">
                                                    {val}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </BaselChartCard>

                        {/* Application Volume -- full 3-col */}
                        <BaselChartCard
                            title="Application Volume"
                            subtitle="Inbound candidates per month"
                            accentColor="accent"
                            className="lg:col-span-3"
                        >
                            <ApplicationVolumeChart
                                data={[]}
                                loading={statsLoading}
                                height={200}
                            />
                        </BaselChartCard>
                    </div>
                </section>

                {/* ── SECTION 4: Roles Table + Activity Sidebar ── */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <BaselSectionHeading
                        kicker="OPERATIONS"
                        title="Role Status"
                        className="section-heading mb-4"
                    />
                    <div className="grid lg:grid-cols-5 gap-4">
                        {/* Roles table */}
                        <div className="lg:col-span-3 bg-base-100 p-4 overflow-x-auto">
                            {rolesLoading ? (
                                <ChartLoadingState height={300} />
                            ) : roles.length === 0 ? (
                                <p className="text-sm text-base-content/40 py-8 text-center">
                                    No active roles. Post a role to start
                                    receiving candidates.
                                </p>
                            ) : (
                                <table className="table table-sm w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] font-black uppercase tracking-wider text-base-content/50">
                                                Role Title
                                            </th>
                                            <th className="text-[10px] font-black uppercase tracking-wider text-base-content/50 hidden md:table-cell">
                                                Location
                                            </th>
                                            <th className="text-[10px] font-black uppercase tracking-wider text-base-content/50 text-right">
                                                Days Open
                                            </th>
                                            <th className="text-[10px] font-black uppercase tracking-wider text-base-content/50 text-right">
                                                Candidates
                                            </th>
                                            <th className="text-[10px] font-black uppercase tracking-wider text-base-content/50">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles
                                            .slice(0, 10)
                                            .map((role: RoleBreakdown) => (
                                                <tr
                                                    key={role.id}
                                                    className="hover"
                                                >
                                                    <td>
                                                        <Link
                                                            href={`/portal/roles/${role.id}`}
                                                            className="text-sm font-semibold hover:text-primary transition-colors"
                                                        >
                                                            {role.title}
                                                        </Link>
                                                    </td>
                                                    <td className="text-xs text-base-content/50 hidden md:table-cell">
                                                        {role.location}
                                                    </td>
                                                    <td className="text-xs font-semibold tabular-nums text-right">
                                                        {role.days_open}
                                                    </td>
                                                    <td className="text-xs font-semibold tabular-nums text-right">
                                                        {role.applications_count.toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <BaselStatusPill
                                                            color={
                                                                STATUS_COLORS[
                                                                    role.status
                                                                ] || "info"
                                                            }
                                                        >
                                                            {role.status}
                                                        </BaselStatusPill>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Recent Activity sidebar */}
                        <div className="lg:col-span-2">
                            <BaselSidebarCard
                                title="Latest Updates"
                                accentColor="accent"
                            >
                                {activityLoading ? (
                                    <ChartLoadingState height={200} />
                                ) : activities.length === 0 ? (
                                    <p className="text-sm text-base-content/40 py-4 text-center">
                                        No activity yet. Updates appear as
                                        candidates move through your pipeline.
                                    </p>
                                ) : (
                                    <div>
                                        {activities
                                            .slice(0, 6)
                                            .map(
                                                (
                                                    activity: CompanyActivity,
                                                    i: number,
                                                ) => {
                                                    const style =
                                                        STAGE_ICONS[
                                                            activity.stage
                                                        ] || DEFAULT_STAGE;
                                                    return (
                                                        <Link
                                                            key={
                                                                activity.id || i
                                                            }
                                                            href={`/portal/applications/${activity.id}`}
                                                            className="block"
                                                        >
                                                            <div className="activity-item flex items-center gap-3 py-3 border-b border-base-300 hover:bg-base-300/50 transition-colors">
                                                                <div
                                                                    className={`w-8 h-8 ${style.bg} flex items-center justify-center flex-shrink-0`}
                                                                >
                                                                    <i
                                                                        className={`${style.icon} ${style.color} text-sm`}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate">
                                                                        {activity.candidate_name ||
                                                                            "Candidate"}
                                                                    </p>
                                                                    <p className="text-xs text-base-content/40">
                                                                        {
                                                                            activity.job_title
                                                                        }{" "}
                                                                        --{" "}
                                                                        {activity.stage?.replace(
                                                                            "_",
                                                                            " ",
                                                                        )}{" "}
                                                                        --{" "}
                                                                        {timeAgo(
                                                                            activity.updated_at,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                },
                                            )}
                                    </div>
                                )}
                            </BaselSidebarCard>
                        </div>
                    </div>
                </section>
            </BaselAnimator>
            <RoleWizardModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSuccess={refreshStats}
            />
        </div>
    );
}
