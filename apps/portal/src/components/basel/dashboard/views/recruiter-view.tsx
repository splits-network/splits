"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import dynamic from "next/dynamic";
import RoleWizardModal from "@/app/portal/roles/components/modals/role-wizard-modal";
import { useRecruiterStats } from "@/app/portal/dashboard/hooks/use-recruiter-stats";
import { useFunnelData } from "@/app/portal/dashboard/hooks/use-funnel-data";
import { useCommissionData } from "@/app/portal/dashboard/hooks/use-commission-data";
import { useReputationData } from "@/app/portal/dashboard/hooks/use-reputation-data";
import { usePipelineActivity } from "@/app/portal/dashboard/hooks/use-pipeline-activity";
import type { PipelineApplication } from "@/app/portal/dashboard/hooks/use-pipeline-activity";
import { useTopRoles } from "@/app/portal/dashboard/hooks/use-top-roles";
import { useTopMatches } from "@/app/portal/dashboard/hooks/use-top-matches";
import { usePlacementTrendData } from "@/app/portal/dashboard/hooks/use-placement-trend-data";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { useDashboardRealtime } from "@/app/portal/dashboard/hooks/use-dashboard-realtime";
import {
    BaselKpiCard,
    BaselChartCard,
    BaselSectionHeading,
    BaselActivityItem,
    BaselSidebarCard,
} from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { PeriodSelector } from "@/components/basel/dashboard/shared/period-selector";
import { KpiGrid } from "@/components/basel/dashboard/shared/kpi-grid";
import { BaselAnimator } from "@/app/portal/dashboard/basel-animator";
import { MarketplaceProfileBanner } from "@/components/basel/dashboard/marketplace-profile-banner";

/* ── Lazy-loaded chart components ──────────────────────────────────────────── */

const PipelineFunnelChart = dynamic(
    () =>
        import("@/components/basel/dashboard/charts/pipeline-funnel-chart").then(
            (m) => ({ default: m.PipelineFunnelChart }),
        ),
    { loading: () => <ChartLoadingState height={200} /> },
);

const PlacementTrendChart = dynamic(
    () =>
        import("@/components/basel/dashboard/charts/placement-trend-chart").then(
            (m) => ({ default: m.PlacementTrendChart }),
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

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function RecruiterView() {
    const { userId, getToken } = useAuth();
    const { profile, manageableCompanyIds } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [canCreateRole, setCanCreateRole] = useState(false);

    useEffect(() => {
        if (manageableCompanyIds.length > 0) {
            setCanCreateRole(true);
            return;
        }
        let cancelled = false;
        async function checkFirm() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: any[] }>(
                    "/firms/my-firms",
                );
                if (!cancelled && res.data?.length > 0) setCanCreateRole(true);
            } catch {
                /* not a firm member */
            }
        }
        checkFirm();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manageableCompanyIds.length]);

    /* Data hooks */
    const {
        stats,
        loading: statsLoading,
        refresh: refreshStats,
    } = useRecruiterStats();
    const { stages, loading: funnelLoading } = useFunnelData(trendPeriod);
    const {
        segments: commissionSegments,
        total: commissionTotal,
        loading: commissionLoading,
    } = useCommissionData(trendPeriod);
    const { metrics: reputation, loading: reputationLoading } =
        useReputationData();
    const {
        applications,
        loading: pipelineLoading,
        refresh: refreshPipeline,
    } = usePipelineActivity();
    const {
        roles,
        loading: rolesLoading,
        refresh: refreshRoles,
    } = useTopRoles();
    const {
        matches: topMatches,
        loading: matchesLoading,
        refresh: refreshMatches,
    } = useTopMatches();
    const {
        data: placementTrendData,
        loading: placementTrendLoading,
        refresh: refreshPlacementTrend,
    } = usePlacementTrendData(trendPeriod);

    /* Realtime */
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => {
        /* hooks refetch on their own */
    }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshRoles();
        refreshPipeline();
        refreshMatches();
        refreshPlacementTrend();
    }, [
        refreshStats,
        refreshRoles,
        refreshPipeline,
        refreshMatches,
        refreshPlacementTrend,
    ]);

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
    });

    /* Reputation labels for radar display */
    const reputationLabels = [
        { key: "speed", label: "Speed" },
        { key: "volume", label: "Volume" },
        { key: "quality", label: "Quality" },
        { key: "collaboration", label: "Collaboration" },
        { key: "consistency", label: "Consistency" },
    ] as const;

    return (
        <div className="min-h-screen bg-base-100">
            <BaselAnimator>
                {/* ── SECTION 1: Header ── */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="section-heading">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                YOUR PIPELINE
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-base-content">
                                {profile?.name || "Recruiter"} Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <PeriodSelector
                                value={trendPeriod}
                                onChange={setTrendPeriod}
                            />
                            {canCreateRole && (
                                <button
                                    onClick={() => setShowAddRoleModal(true)}
                                    className="btn btn-primary btn-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-plus" />{" "}
                                    Create Role
                                </button>
                            )}
                            <Link
                                href="/portal/roles"
                                className="btn btn-ghost btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase" />{" "}
                                Browse Roles
                            </Link>
                            <Link
                                href="/portal/candidates"
                                className="btn btn-ghost btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-users" />{" "}
                                My Candidates
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Marketplace Profile Reminder ── */}
                <MarketplaceProfileBanner />

                {/* ── SECTION 2: KPIs ── */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <KpiGrid cols={5}>
                        <BaselKpiCard
                            label="Pipeline Value"
                            value={
                                statsLoading
                                    ? "--"
                                    : formatCurrency(stats.pipeline_value)
                            }
                            icon="fa-duotone fa-regular fa-sack-dollar"
                            color="primary"
                        />
                        <BaselKpiCard
                            label="Active Roles"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.active_roles.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-briefcase"
                            color="secondary"
                            {...formatTrend(stats.trends?.active_roles)}
                        />
                        <BaselKpiCard
                            label="Submissions MTD"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.submissions_mtd.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-paper-plane"
                            color="accent"
                        />
                        <BaselKpiCard
                            label="Placements YTD"
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
                            label="Commissions YTD"
                            value={
                                statsLoading
                                    ? "--"
                                    : formatCurrency(stats.total_earnings_ytd)
                            }
                            icon="fa-duotone fa-regular fa-coins"
                            color="primary"
                        />
                        <BaselKpiCard
                            label="Candidates Active"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.candidates_in_process.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-users"
                            color="info"
                            {...formatTrend(
                                stats.trends?.candidates_in_process,
                            )}
                        />
                        <BaselKpiCard
                            label="Offers Pending"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.offers_pending.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-handshake"
                            color="warning"
                        />
                        <BaselKpiCard
                            label="Pending Payouts"
                            value={
                                statsLoading
                                    ? "--"
                                    : formatCurrency(stats.pending_payouts)
                            }
                            icon="fa-duotone fa-regular fa-wallet"
                            color="secondary"
                        />
                        <BaselKpiCard
                            label="Needs Attention"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.stale_candidates.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-clock"
                            color="error"
                        />
                        <BaselKpiCard
                            label="Awaiting Review"
                            value={
                                statsLoading
                                    ? "--"
                                    : stats.pending_reviews.toLocaleString()
                            }
                            icon="fa-duotone fa-regular fa-clipboard-check"
                            color="accent"
                        />
                        <BaselKpiCard
                            label="New Matches"
                            value={
                                matchesLoading
                                    ? "--"
                                    : String(topMatches.length)
                            }
                            icon="fa-duotone fa-regular fa-bullseye"
                            color="info"
                        />
                    </KpiGrid>
                </section>

                {/* ── SECTION 3: Charts ── */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <BaselSectionHeading
                        kicker="ANALYTICS"
                        title="Performance Overview"
                        className="section-heading mb-4"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Recruitment Funnel */}
                        <BaselChartCard
                            title="Candidate Funnel"
                            subtitle="Candidates by pipeline stage"
                            accentColor="primary"
                            className="lg:col-span-2"
                        >
                            <PipelineFunnelChart
                                stages={stages}
                                loading={funnelLoading}
                                height={200}
                            />
                        </BaselChartCard>

                        {/* Commission Donut (rendered as bar breakdown) */}
                        <BaselChartCard
                            title="Earnings by Role"
                            subtitle={
                                commissionLoading
                                    ? "Loading..."
                                    : `Total earned: ${formatCurrency(commissionTotal)}`
                            }
                            accentColor="accent"
                        >
                            {commissionLoading ? (
                                <ChartLoadingState height={200} />
                            ) : commissionSegments.length === 0 ? (
                                <p className="text-sm text-base-content/40 py-8 text-center">
                                    No earnings recorded. Commission data
                                    appears after your first placement.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {commissionSegments
                                        .slice(0, 8)
                                        .map((seg) => {
                                            const pct =
                                                commissionTotal > 0
                                                    ? (seg.amount /
                                                          commissionTotal) *
                                                      100
                                                    : 0;
                                            return (
                                                <div
                                                    key={seg.role}
                                                    className="space-y-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-base-content/60 truncate">
                                                            {seg.role}
                                                        </span>
                                                        <span className="text-xs font-semibold tabular-nums">
                                                            {formatCurrency(
                                                                seg.amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-base-300">
                                                        <div
                                                            className="h-full bg-accent"
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </BaselChartCard>

                        {/* Placement Trend */}
                        <BaselChartCard
                            title="Placement Trend"
                            subtitle="Monthly placement volume"
                            accentColor="success"
                            className="lg:col-span-2"
                        >
                            <PlacementTrendChart
                                data={placementTrendData}
                                loading={placementTrendLoading}
                                height={200}
                            />
                        </BaselChartCard>

                        {/* Reputation Radar (rendered as bar metrics) */}
                        <BaselChartCard
                            title="Reputation Score"
                            subtitle="Performance across five dimensions"
                            accentColor="secondary"
                        >
                            {reputationLoading ? (
                                <ChartLoadingState height={200} />
                            ) : (
                                <div className="space-y-3">
                                    {reputationLabels.map(({ key, label }) => {
                                        const val =
                                            reputation[
                                                key as keyof typeof reputation
                                            ] || 0;
                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="text-xs text-base-content/60 w-24 shrink-0">
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
                    </div>
                </section>

                {/* ── SECTION 4: Activity + Sidebar ── */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <BaselSectionHeading
                        kicker="LIVE FEED"
                        title="Pipeline Activity"
                        className="section-heading mb-4"
                    />
                    <div className="grid lg:grid-cols-5 gap-4">
                        {/* Pipeline activity feed */}
                        <div className="lg:col-span-3 bg-base-100 p-4">
                            {pipelineLoading ? (
                                <ChartLoadingState height={300} />
                            ) : applications.length === 0 ? (
                                <p className="text-sm text-base-content/40 py-8 text-center">
                                    No pipeline activity yet. Submit a candidate
                                    to a role to begin tracking.
                                </p>
                            ) : (
                                <div>
                                    {applications
                                        .slice(0, 8)
                                        .map(
                                            (
                                                app: PipelineApplication,
                                                i: number,
                                            ) => {
                                                const style =
                                                    STAGE_ICONS[app.stage] ||
                                                    DEFAULT_STAGE;
                                                return (
                                                    <BaselActivityItem
                                                        key={app.id || i}
                                                        icon={style.icon}
                                                        iconColor={style.color}
                                                        iconBg={style.bg}
                                                        title={`${app.candidate?.full_name || "Candidate"} - ${app.job?.title || "Role"}`}
                                                        meta={`${app.job?.company?.name || ""} -- ${app.stage?.replace("_", " ")} -- ${timeAgo(app.updated_at)}`}
                                                    />
                                                );
                                            },
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Top Roles sidebar */}
                        <div className="lg:col-span-2">
                            <BaselSidebarCard
                                title="Highest Activity Roles"
                                accentColor="primary"
                            >
                                {rolesLoading ? (
                                    <ChartLoadingState height={200} />
                                ) : roles.length === 0 ? (
                                    <p className="text-sm text-base-content/40 py-4 text-center">
                                        No active roles. Browse open roles to
                                        start submitting candidates.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {roles.slice(0, 5).map((role, i) => (
                                            <Link
                                                key={role.id}
                                                href={`/portal/roles?roledId=${role.id}`}
                                                className="flex items-center gap-3 py-2 border-b border-base-300 last:border-0 hover:bg-base-300/50 transition-colors group"
                                            >
                                                <span className="w-6 h-6 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                        {role.title}
                                                    </p>
                                                    <p className="text-xs text-base-content/40 truncate">
                                                        {role.company?.name}
                                                        {role.location &&
                                                            ` -- ${role.location}`}
                                                    </p>
                                                </div>
                                                {(role.candidate_count ?? 0) >
                                                    0 && (
                                                    <span className="px-2 py-0.5 text-sm font-bold bg-success/10 text-success">
                                                        {role.candidate_count}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </BaselSidebarCard>

                            <BaselSidebarCard
                                title="Top Matches"
                                accentColor="secondary"
                            >
                                {matchesLoading ? (
                                    <ChartLoadingState height={200} />
                                ) : topMatches.length === 0 ? (
                                    <p className="text-sm text-base-content/40 py-4 text-center">
                                        No matches yet. Matches appear when
                                        candidates are scored against roles.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {topMatches.map((match) => {
                                            const fullName =
                                                match.candidate?.full_name ||
                                                "Unknown";
                                            const initials =
                                                fullName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2) || "?";
                                            const name = fullName;
                                            return (
                                                <Link
                                                    key={match.id}
                                                    href={`/portal/matches?matchId=${match.id}`}
                                                    className="flex items-center gap-3 hover:bg-base-200/50 p-2 -mx-2 rounded transition-colors"
                                                >
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                                                            {initials.toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">
                                                            {name}
                                                        </p>
                                                        <p className="text-sm text-base-content/60 truncate">
                                                            {match.job?.title ||
                                                                "Unknown Role"}
                                                        </p>
                                                    </div>
                                                    <MatchScoreBadge
                                                        score={
                                                            match.match_score
                                                        }
                                                        size="sm"
                                                    />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="mt-3 pt-3 border-t border-base-200 text-center">
                                    <Link
                                        href="/portal/matches"
                                        className="btn btn-sm btn-ghost btn-block"
                                    >
                                        View all matches{" "}
                                        <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                                    </Link>
                                </div>
                            </BaselSidebarCard>
                        </div>
                    </div>
                </section>
            </BaselAnimator>

            <ModalPortal>
                {showAddRoleModal && (
                    <RoleWizardModal
                        isOpen={showAddRoleModal}
                        mode="create"
                        onClose={() => setShowAddRoleModal(false)}
                        onSuccess={() => setShowAddRoleModal(false)}
                    />
                )}
            </ModalPortal>
        </div>
    );
}
