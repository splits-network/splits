"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { HeatmapChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { HeatmapDay } from "@/app/portal/dashboard/hooks/use-submission-heatmap";

interface CompanySubmissionHeatmapProps {
    days: HeatmapDay[];
    loading: boolean;
}

export function CompanySubmissionHeatmap({
    days,
    loading,
}: CompanySubmissionHeatmapProps) {
    const totalSubmissions = days.reduce((sum, d) => sum + d.count, 0);
    const peakDay = days.length > 0
        ? days.reduce((max, d) => (d.count > max.count ? d : max), days[0])
        : null;

    return (
        <BaselChartCard
            title="Submission Activity"
            subtitle={
                loading
                    ? "Loading..."
                    : `${totalSubmissions.toLocaleString()} submissions${peakDay ? ` · Peak: ${peakDay.date}` : ""}`
            }
            accentColor="info"
            compact
        >
            {loading ? (
                <ChartLoadingState height={140} />
            ) : days.length === 0 ? (
                <p className="text-sm text-base-content/40 py-6 text-center">
                    No submission data yet.
                </p>
            ) : (
                <HeatmapChart
                    data={days.map((d) => ({ date: d.date, value: d.count }))}
                    height={140}
                    className="w-full"
                />
            )}
        </BaselChartCard>
    );
}
