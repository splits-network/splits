"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { GaugeChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useSpeedMetrics } from "@/app/portal/dashboard/hooks/use-speed-metrics";

export function RecruiterSpeedCard() {
    const { avgDays, platformAvg, loading } = useSpeedMetrics();

    const isFaster = avgDays <= platformAvg;

    return (
        <BaselChartCard
            title="Time to Submit"
            subtitle={
                loading
                    ? "Loading..."
                    : `Your avg: ${avgDays}d · Platform avg: ${platformAvg}d`
            }
            accentColor={isFaster ? "success" : "warning"}
            compact
        >
            {loading ? (
                <ChartLoadingState height={200} />
            ) : (
                <GaugeChart
                    value={avgDays}
                    max={Math.max(platformAvg * 2, avgDays * 1.5, 30)}
                    label="Days"
                    height={200}
                />
            )}
        </BaselChartCard>
    );
}
