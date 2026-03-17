"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { StackedBarChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { FunnelStage } from "@/app/portal/dashboard/hooks/use-funnel-data";

interface EarningsForecastProps {
    stages: FunnelStage[];
    funnelLoading: boolean;
    commissionTotal: number;
}

/**
 * Stage-based probability multipliers for earnings forecasting.
 * Keys match the capitalized labels from the funnel hook.
 */
const STAGE_PROBABILITIES: Record<string, number> = {
    Submitted: 0.05,
    Screen: 0.1,
    "Company Review": 0.15,
    Interview: 0.3,
    Offer: 0.7,
    Hired: 1.0,
};

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value.toFixed(0)}`;
}

export function RecruiterEarningsForecast({
    stages,
    funnelLoading,
    commissionTotal,
}: EarningsForecastProps) {
    if (funnelLoading) {
        return (
            <BaselChartCard
                title="Earnings Forecast"
                subtitle="Projected commissions by stage probability"
                accentColor="accent"
                compact
            >
                <ChartLoadingState height={200} />
            </BaselChartCard>
        );
    }

    // Estimate avg commission per placement from YTD data
    const hiredCount =
        stages.find((s) => s.label === "Hired")?.count || 1;
    const avgCommission =
        commissionTotal > 0 ? commissionTotal / Math.max(hiredCount, 1) : 5000;

    // Calculate weighted forecast per stage
    const categories: string[] = [];
    const confirmedData: number[] = [];
    const projectedData: number[] = [];

    for (const s of stages) {
        const prob = STAGE_PROBABILITIES[s.label] ?? 0.1;
        const projected = s.count * avgCommission * prob;
        const confirmed = s.label === "Hired" ? s.count * avgCommission : 0;

        categories.push(s.label);
        confirmedData.push(Math.round(confirmed));
        projectedData.push(Math.round(projected - confirmed));
    }

    const totalForecast = confirmedData.reduce((a, b) => a + b, 0) +
        projectedData.reduce((a, b) => a + b, 0);

    return (
        <BaselChartCard
            title="Earnings Forecast"
            subtitle={`Projected: ${formatCurrency(totalForecast)} (weighted by stage probability)`}
            accentColor="accent"
            compact
        >
            {stages.length === 0 ? (
                <p className="text-sm text-base-content/40 py-8 text-center">
                    No pipeline data to forecast. Submit candidates to see
                    projections.
                </p>
            ) : (
                <StackedBarChart
                    categories={categories}
                    series={[
                        { name: "Confirmed", data: confirmedData },
                        { name: "Projected", data: projectedData },
                    ]}
                    height={200}
                    showLegend
                />
            )}
        </BaselChartCard>
    );
}
