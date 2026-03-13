"use client";

import { BaselKpiCard } from "@splits-network/basel-ui";
import { KpiGrid } from "@/components/basel/dashboard/shared/kpi-grid";
import type { CompanyStats } from "@/app/portal/dashboard/hooks/use-company-stats";
import type { CostMetrics } from "@/app/portal/dashboard/hooks/use-cost-metrics";

interface CompanyKpisProps {
    stats: CompanyStats;
    statsLoading: boolean;
    costMetrics: CostMetrics;
    costLoading: boolean;
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

export function CompanyKpis({
    stats,
    statsLoading,
    costMetrics,
    costLoading,
}: CompanyKpisProps) {
    const loading = statsLoading || costLoading;

    return (
        <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6 space-y-3">
            {/* Primary — executive-level metrics */}
            <KpiGrid cols={4}>
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
                    label="Cost per Hire"
                    value={
                        loading
                            ? "--"
                            : formatCurrency(costMetrics.costPerHire)
                    }
                    icon="fa-duotone fa-regular fa-receipt"
                    color="accent"
                />
                <BaselKpiCard
                    label="Spend YTD"
                    value={
                        loading
                            ? "--"
                            : formatCurrency(costMetrics.spendYtd)
                    }
                    icon="fa-duotone fa-regular fa-sack-dollar"
                    color="primary"
                />
            </KpiGrid>

            {/* Secondary — operational */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                <BaselKpiCard
                    size="compact"
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
                    size="compact"
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
                    size="compact"
                    label="Interviews"
                    value={
                        statsLoading
                            ? "--"
                            : stats.interviews_scheduled.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-calendar-check"
                    color="info"
                />
                <BaselKpiCard
                    size="compact"
                    label="Offers Out"
                    value={
                        statsLoading
                            ? "--"
                            : stats.offers_extended.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-handshake"
                    color="accent"
                />
                <BaselKpiCard
                    size="compact"
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
                    size="compact"
                    label="Avg Fee %"
                    value={
                        loading
                            ? "--"
                            : `${costMetrics.avgFeePercent.toFixed(1)}%`
                    }
                    icon="fa-duotone fa-regular fa-percent"
                    color="secondary"
                />
                <BaselKpiCard
                    size="compact"
                    label="Apps This Month"
                    value={
                        statsLoading
                            ? "--"
                            : stats.applications_mtd.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-paper-plane"
                    color="info"
                />
                <BaselKpiCard
                    size="compact"
                    label="Roles Stalled"
                    value={
                        statsLoading
                            ? "--"
                            : stats.stale_roles.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-clock"
                    color="error"
                />
            </div>
        </section>
    );
}
