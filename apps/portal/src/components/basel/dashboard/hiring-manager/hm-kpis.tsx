"use client";

import { BaselKpiCard } from "@splits-network/basel-ui";
import { KpiGrid } from "@/components/basel/dashboard/shared/kpi-grid";
import type { CompanyStats } from "@/app/portal/dashboard/hooks/use-company-stats";

interface HmKpisProps {
    stats: CompanyStats;
    statsLoading: boolean;
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

export function HmKpis({ stats, statsLoading }: HmKpisProps) {
    return (
        <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6 space-y-3">
            {/* Primary — hiring-focused metrics */}
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
                    label="Interviews"
                    value={
                        statsLoading
                            ? "--"
                            : stats.interviews_scheduled.toLocaleString()
                    }
                    icon="fa-duotone fa-regular fa-calendar-check"
                    color="warning"
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
            </KpiGrid>

            {/* Secondary — operational */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
