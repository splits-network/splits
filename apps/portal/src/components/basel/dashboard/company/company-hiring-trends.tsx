"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { LineChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { ApplicationVolumePoint } from "@/app/portal/dashboard/hooks/use-application-volume";

interface CompanyHiringTrendsProps {
    /** Application volume by month */
    applicationData: ApplicationVolumePoint[];
    applicationLoading: boolean;
    /** Placements by month */
    placementData: { month: string; count: number }[];
    placementLoading: boolean;
}

export function CompanyHiringTrends({
    applicationData,
    applicationLoading,
    placementData,
    placementLoading,
}: CompanyHiringTrendsProps) {
    const loading = applicationLoading || placementLoading;

    // Build merged x-axis labels from application data
    const xLabels = applicationData.map((d) => d.period);

    // Map placement data to same x-axis (match by label)
    const placementMap = new Map(
        placementData.map((d) => [d.month, d.count]),
    );
    const placementSeries = xLabels.map(
        (label) => placementMap.get(label) ?? 0,
    );

    const series = [
        {
            name: "Applications",
            data: applicationData.map((d) => d.count),
            smooth: true,
        },
        {
            name: "Placements",
            data: placementSeries,
            smooth: true,
        },
    ];

    return (
        <BaselChartCard
            title="Hiring Trends"
            subtitle="Applications vs placements over time"
            accentColor="secondary"
            compact
        >
            {loading ? (
                <ChartLoadingState height={200} />
            ) : applicationData.length === 0 ? (
                <p className="text-sm text-base-content/40 py-6 text-center">
                    No trend data available yet.
                </p>
            ) : (
                <LineChart
                    series={series}
                    xLabels={xLabels}
                    height={200}
                    showLegend
                    smooth
                />
            )}
        </BaselChartCard>
    );
}
