"use client";

import { BaselKpiCard } from "@splits-network/basel-ui";
import { KpiGrid } from "@/components/basel/dashboard/shared/kpi-grid";
import type { RecruiterStats } from "@/app/portal/dashboard/hooks/use-recruiter-stats";

interface RecruiterKpisProps {
    stats: RecruiterStats;
    statsLoading: boolean;
    matchCount: number;
    matchesLoading: boolean;
}

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

export function RecruiterKpis({
    stats,
    statsLoading,
    matchCount,
    matchesLoading,
}: RecruiterKpisProps) {
    return (
        <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6 space-y-3">
            {/* Primary metrics */}
            <KpiGrid cols={4}>
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
                    color="accent"
                />
            </KpiGrid>

            {/* Secondary metrics — compact */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                <BaselKpiCard
                    size="compact"
                    label="Submissions MTD"
                    value={
                        statsLoading
                            ? "--"
                            : stats.submissions_mtd.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-paper-plane"
                    color="primary"
                />
                <BaselKpiCard
                    size="compact"
                    label="Candidates Active"
                    value={
                        statsLoading
                            ? "--"
                            : stats.candidates_in_process.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-users"
                    color="info"
                    {...formatTrend(stats.trends?.candidates_in_process)}
                />
                <BaselKpiCard
                    size="compact"
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
                    size="compact"
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
                    size="compact"
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
                    size="compact"
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
                    size="compact"
                    label="New Matches"
                    value={matchesLoading ? "--" : String(matchCount)}
                    icon="fa-duotone fa-regular fa-bullseye"
                    color="info"
                />
            </div>
        </section>
    );
}
