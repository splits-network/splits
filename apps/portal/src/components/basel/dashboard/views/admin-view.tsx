"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { usePlatformStats } from "@/app/portal/dashboard/hooks/use-platform-stats";
import { useOnlineActivity } from "@/app/portal/dashboard/hooks/use-online-activity";
import { useDashboardRealtime } from "@/app/portal/dashboard/hooks/use-dashboard-realtime";
import { usePlatformActivity } from "@/app/portal/dashboard/hooks/use-platform-activity";
import type { PlatformActivityEvent } from "@/app/portal/dashboard/hooks/use-platform-activity";
import { useTopPerformers } from "@/app/portal/dashboard/hooks/use-top-performers";
import { useMarketplaceHealth } from "@/app/portal/dashboard/hooks/use-marketplace-health";
import { usePlatformPipeline } from "@/app/portal/dashboard/hooks/use-platform-pipeline";
import {
    BaselKpiCard,
    BaselChartCard,
    BaselSectionHeading,
    BaselActivityItem,
    BaselSidebarCard,
} from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { PeriodSelector } from "@/components/basel/dashboard/shared/period-selector";
import { LiveIndicator } from "@/components/basel/dashboard/shared/live-indicator";
import { KpiGrid } from "@/components/basel/dashboard/shared/kpi-grid";
import { UrgencyAlerts } from "@/components/basel/dashboard/shared/urgency-alerts";
import { BaselAnimator } from "@/app/portal/dashboard/basel-animator";

/* ── Lazy-loaded chart components ──────────────────────────────────────────── */

const PipelineFunnelChart = dynamic(
    () =>
        import("@/components/basel/dashboard/charts/pipeline-funnel-chart").then(
            (m) => ({ default: m.PipelineFunnelChart }),
        ),
    { loading: () => <ChartLoadingState height={200} /> },
);

const RevenueTrendChart = dynamic(
    () =>
        import("@/components/basel/dashboard/charts/revenue-trend-chart").then(
            (m) => ({ default: m.RevenueTrendChart }),
        ),
    { loading: () => <ChartLoadingState height={200} /> },
);

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
}

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

const EVENT_ICONS: Record<string, { icon: string; color: string; bg: string }> =
    {
        placement: {
            icon: "fa-duotone fa-regular fa-trophy",
            color: "text-success",
            bg: "bg-success/10",
        },
        recruiter_join: {
            icon: "fa-duotone fa-regular fa-user-plus",
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
        company_join: {
            icon: "fa-duotone fa-regular fa-building",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        fraud_alert: {
            icon: "fa-duotone fa-regular fa-shield-exclamation",
            color: "text-error",
            bg: "bg-error/10",
        },
        application: {
            icon: "fa-duotone fa-regular fa-file-lines",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        payout: {
            icon: "fa-duotone fa-regular fa-money-bill-transfer",
            color: "text-warning",
            bg: "bg-warning/10",
        },
    };

const DEFAULT_EVENT = {
    icon: "fa-duotone fa-regular fa-circle",
    color: "text-primary",
    bg: "bg-primary/10",
};

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function AdminView() {
    const { userId } = useAuth();
    const [trendPeriod, setTrendPeriod] = useState(6);

    /* Data hooks */
    const {
        stats,
        loading: statsLoading,
        refresh: refreshStats,
    } = usePlatformStats();
    const {
        snapshot,
        loading: snapshotLoading,
        refresh: refreshSnapshot,
        setSnapshot,
    } = useOnlineActivity();
    const {
        events,
        loading: activityLoading,
        refresh: refreshActivity,
    } = usePlatformActivity();
    const {
        performers,
        loading: performersLoading,
        refresh: refreshPerformers,
    } = useTopPerformers();
    const {
        health,
        loading: healthLoading,
        refresh: refreshHealth,
    } = useMarketplaceHealth();
    const {
        stages,
        loading: pipelineLoading,
        refresh: refreshPipeline,
    } = usePlatformPipeline();

    /* Realtime */
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => {
        /* no chart refresh key needed; hooks re-fetch */
    }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshPipeline();
        refreshHealth();
        refreshActivity();
        refreshPerformers();
        refreshSnapshot();
    }, [
        refreshStats,
        refreshPipeline,
        refreshHealth,
        refreshActivity,
        refreshPerformers,
        refreshSnapshot,
    ]);
    const handleActivityUpdate = useCallback(
        (snap: any) => {
            setSnapshot(snap);
        },
        [setSnapshot],
    );

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
        onActivityUpdate: handleActivityUpdate,
        extraChannels: ["dashboard:activity"],
    });

    /* Polling fallback */
    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
            refreshActivity();
            refreshPerformers();
            refreshSnapshot();
        }, 60_000);
        return () => clearInterval(interval);
    }, [refreshStats, refreshActivity, refreshPerformers, refreshSnapshot]);

    /* Urgency alerts */
    const urgencyAlerts = [
        {
            label: "Fraud signals",
            count: stats.active_fraud_signals,
            color: "error" as const,
            icon: "fa-duotone fa-regular fa-shield-exclamation",
        },
        {
            label: "Pending approvals",
            count: stats.pending_recruiter_approvals,
            color: "warning" as const,
            icon: "fa-duotone fa-regular fa-user-clock",
        },
        {
            label: "Past due subscriptions",
            count: stats.past_due_subscriptions,
            color: "warning" as const,
            icon: "fa-duotone fa-regular fa-credit-card",
        },
    ];

    return (
        <div className="min-h-screen bg-base-100">
            <BaselAnimator>
                {/* ── SECTION 1: Header ── */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="section-heading">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                PLATFORM OVERVIEW
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-base-content">
                                Command Center
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <PeriodSelector
                                value={trendPeriod}
                                onChange={setTrendPeriod}
                            />
                            <LiveIndicator online={snapshot?.total_online} />
                        </div>
                    </div>

                    {/* Urgency alerts */}
                    {!statsLoading && (
                        <div className="mt-3">
                            <UrgencyAlerts alerts={urgencyAlerts} />
                        </div>
                    )}
                </section>

                {/* ── SECTION 2: KPIs ── */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <KpiGrid cols={4}>
                        <BaselKpiCard
                            label="Active Jobs"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.active_jobs.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-briefcase"
                            color="primary"
                            {...formatTrend(stats.trends?.active_jobs)}
                        />
                        <BaselKpiCard
                            label="Active Recruiters"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.active_recruiters.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-user-tie"
                            color="secondary"
                            {...formatTrend(stats.trends?.active_recruiters)}
                        />
                        <BaselKpiCard
                            label="Applications"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.total_applications.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-file-lines"
                            color="accent"
                            {...formatTrend(stats.trends?.total_applications)}
                        />
                        <BaselKpiCard
                            label="Placements YTD"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.total_placements.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-trophy"
                            color="success"
                            {...formatTrend(stats.trends?.total_placements)}
                        />
                        <BaselKpiCard
                            label="Revenue YTD"
                            value={
                                statsLoading
                                    ? "--"
                                    : formatCurrency(stats.total_revenue)
                            }
                            icon="fa-duotone fa-regular fa-dollar-sign"
                            color="primary"
                            {...formatTrend(stats.trends?.total_revenue)}
                        />
                        <BaselKpiCard
                            label="Online Now"
                            value={
                                snapshotLoading
                                    ? "--"
                                    : (
                                          snapshot?.total_online ?? 0
                                      ).toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-signal-stream"
                            color="info"
                        />
                        <BaselKpiCard
                            label="Pending Payouts"
                            value={
                                statsLoading
                                    ? "--"
                                    : formatCurrency(
                                          stats.pending_payouts_amount,
                                      )
                            }
                            icon="fa-duotone fa-regular fa-money-bill-transfer"
                            color="warning"
                        />
                        <BaselKpiCard
                            label="Signups MTD"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.new_signups_mtd.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-user-plus"
                            color="secondary"
                        />
                    </KpiGrid>
                </section>

                {/* ── SECTION 3: Charts ── */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <BaselSectionHeading
                        kicker="ANALYTICS"
                        title="Pipeline and Revenue"
                        className="section-heading mb-4"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <BaselChartCard
                            title="Pipeline Funnel"
                            subtitle="Applications by stage"
                            accentColor="primary"
                            className="lg:col-span-2"
                        >
                            <PipelineFunnelChart
                                stages={stages}
                                loading={pipelineLoading}
                                height={200}
                            />
                        </BaselChartCard>

                        <BaselChartCard
                            title="Marketplace Health"
                            subtitle={`Overall score: ${health.overallScore}%`}
                            accentColor="secondary"
                        >
                            {healthLoading ? (
                                <ChartLoadingState height={200} />
                            ) : (
                                <div className="space-y-3">
                                    {health.labels.map((label, i) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="text-xs text-base-content/60 w-28 shrink-0 truncate">
                                                {label}
                                            </span>
                                            <div className="flex-1 h-2 bg-base-300">
                                                <div
                                                    className="h-full bg-secondary"
                                                    style={{
                                                        width: `${health.values[i] || 0}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold tabular-nums w-8 text-right">
                                                {health.values[i] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </BaselChartCard>

                        <BaselChartCard
                            title="Revenue Trend"
                            subtitle="Monthly revenue and placement volume"
                            accentColor="accent"
                            className="lg:col-span-2"
                        >
                            <RevenueTrendChart
                                data={[]}
                                loading={statsLoading}
                                height={200}
                            />
                        </BaselChartCard>

                        <BaselChartCard
                            title="Active Sessions"
                            subtitle="Users online by application"
                            accentColor="info"
                        >
                            {snapshotLoading || !snapshot ? (
                                <ChartLoadingState height={200} />
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-base-content/60">
                                            Portal
                                        </span>
                                        <span className="text-sm font-bold tabular-nums">
                                            {snapshot.by_app.portal}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-base-content/60">
                                            Candidate
                                        </span>
                                        <span className="text-sm font-bold tabular-nums">
                                            {snapshot.by_app.candidate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-base-content/60">
                                            Corporate
                                        </span>
                                        <span className="text-sm font-bold tabular-nums">
                                            {snapshot.by_app.corporate}
                                        </span>
                                    </div>
                                    <div className="border-t border-base-300 pt-2 mt-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-base-content/60">
                                            Authenticated
                                        </span>
                                        <span className="text-sm font-bold tabular-nums">
                                            {snapshot.authenticated}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-base-content/60">
                                            Anonymous
                                        </span>
                                        <span className="text-sm font-bold tabular-nums text-base-content/40">
                                            {snapshot.anonymous}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </BaselChartCard>
                    </div>
                </section>

                {/* ── SECTION 4: Activity + Sidebar ── */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <BaselSectionHeading
                        kicker="LIVE FEED"
                        title="Recent Activity"
                        className="section-heading mb-4"
                    />
                    <div className="grid lg:grid-cols-5 gap-4">
                        {/* Activity feed */}
                        <div className="lg:col-span-3 bg-base-100 p-4">
                            {activityLoading ? (
                                <ChartLoadingState height={300} />
                            ) : events.length === 0 ? (
                                <p className="text-sm text-base-content/40 py-8 text-center">
                                    No activity recorded yet. Events will appear
                                    here as the platform is used.
                                </p>
                            ) : (
                                <div>
                                    {events
                                        .slice(0, 8)
                                        .map(
                                            (
                                                event: PlatformActivityEvent,
                                                i: number,
                                            ) => {
                                                const style =
                                                    EVENT_ICONS[event.type] ||
                                                    DEFAULT_EVENT;
                                                return (
                                                    <BaselActivityItem
                                                        key={`${event.type}-${i}`}
                                                        icon={style.icon}
                                                        iconColor={style.color}
                                                        iconBg={style.bg}
                                                        title={event.title}
                                                        meta={`${event.description} -- ${timeAgo(event.created_at)}`}
                                                    />
                                                );
                                            },
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Top Performers sidebar */}
                        <div className="lg:col-span-2">
                            <BaselSidebarCard
                                title="Top Performers"
                                accentColor="primary"
                            >
                                {performersLoading ? (
                                    <ChartLoadingState height={200} />
                                ) : performers.length === 0 ? (
                                    <p className="text-sm text-base-content/40 py-4 text-center">
                                        No placements recorded. Rankings appear
                                        after the first closed placement.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {performers
                                            .slice(0, 5)
                                            .map((performer, i) => {
                                                const names =
                                                    performer.recruiter_name.split(
                                                        " ",
                                                    );
                                                const initials =
                                                    `${names[0]?.[0] || ""}${names[1]?.[0] || ""}`.toUpperCase();

                                                return (
                                                    <div
                                                        key={
                                                            performer.recruiter_id
                                                        }
                                                        className="flex items-center gap-3"
                                                    >
                                                        <span className="text-xs font-bold text-base-content/30 w-4 tabular-nums">
                                                            {i + 1}
                                                        </span>
                                                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-bold text-primary">
                                                                {initials}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">
                                                                {
                                                                    performer.recruiter_name
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-bold tabular-nums text-primary">
                                                            {
                                                                performer.placement_count
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </BaselSidebarCard>
                        </div>
                    </div>
                </section>
            </BaselAnimator>
        </div>
    );
}
