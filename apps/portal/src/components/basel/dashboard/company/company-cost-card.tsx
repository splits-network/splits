"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { BarChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { CostMetrics } from "@/app/portal/dashboard/hooks/use-cost-metrics";

interface CompanyCostCardProps {
    costMetrics: CostMetrics;
    loading: boolean;
    /** Monthly placement data to show cost trend */
    placementsByMonth: { month: string; count: number; cost: number }[];
}

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value.toFixed(0)}`;
}

export function CompanyCostCard({
    costMetrics,
    loading,
    placementsByMonth,
}: CompanyCostCardProps) {
    return (
        <BaselChartCard
            title="Recruiting Spend"
            subtitle={
                loading
                    ? "Loading..."
                    : `YTD: ${formatCurrency(costMetrics.spendYtd)} · ${formatCurrency(costMetrics.costPerHire)}/hire · ${costMetrics.avgFeePercent}% avg fee`
            }
            accentColor="accent"
            compact
        >
            {loading ? (
                <ChartLoadingState height={200} />
            ) : placementsByMonth.length === 0 ? (
                <p className="text-sm text-base-content/40 py-8 text-center">
                    No placement cost data yet. Costs appear after your first
                    hire through the platform.
                </p>
            ) : (
                <BarChart
                    data={placementsByMonth.map((m) => ({
                        label: m.month,
                        value: m.cost,
                    }))}
                    height={200}
                />
            )}
        </BaselChartCard>
    );
}
