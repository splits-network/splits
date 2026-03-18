"use client";

import dynamic from "next/dynamic";
import { BaselChartCard, BaselSectionHeading } from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { RadarChart } from "@splits-network/shared-charts";
import { CommissionDonutChart } from "@/components/basel/dashboard/charts/commission-donut-chart";
import type { ReputationMetrics } from "@/app/portal/dashboard/hooks/use-reputation-data";
import type { FunnelStage } from "@/app/portal/dashboard/hooks/use-funnel-data";
import type { CommissionSegment } from "@/app/portal/dashboard/hooks/use-commission-data";

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

interface RecruiterChartsProps {
    stages: FunnelStage[];
    funnelLoading: boolean;
    commissionSegments: CommissionSegment[];
    commissionTotal: number;
    commissionLoading: boolean;
    placementTrendData: { month: string; count: number }[];
    placementTrendLoading: boolean;
    reputation: ReputationMetrics;
    reputationLoading: boolean;
}

const REPUTATION_INDICATORS = [
    { name: "Speed", max: 100 },
    { name: "Volume", max: 100 },
    { name: "Quality", max: 100 },
    { name: "Collaboration", max: 100 },
    { name: "Consistency", max: 100 },
];

export function RecruiterCharts({
    stages,
    funnelLoading,
    commissionSegments,
    commissionTotal,
    commissionLoading,
    placementTrendData,
    placementTrendLoading,
    reputation,
    reputationLoading,
}: RecruiterChartsProps) {
    const radarSeries = [
        {
            name: "Score",
            data: [
                reputation.speed,
                reputation.volume,
                reputation.quality,
                reputation.collaboration,
                reputation.consistency,
            ],
        },
    ];

    return (
        <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
            <BaselSectionHeading
                kicker="ANALYTICS"
                title="Performance Overview"
                className="section-heading mb-4"
            />

            {/* Row 1: 3 equal columns — Funnel, Placement Trend, Earnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <BaselChartCard
                    title="Candidate Funnel"
                    subtitle="Candidates by pipeline stage"
                    accentColor="primary"
                    compact
                >
                    <PipelineFunnelChart
                        stages={stages}
                        loading={funnelLoading}
                        height={200}
                    />
                </BaselChartCard>

                <BaselChartCard
                    title="Placement Trend"
                    subtitle="Monthly placement volume"
                    accentColor="success"
                    compact
                >
                    <PlacementTrendChart
                        data={placementTrendData}
                        loading={placementTrendLoading}
                        height={200}
                    />
                </BaselChartCard>

                <BaselChartCard
                    title="Earnings by Role"
                    subtitle={
                        commissionLoading
                            ? "Loading..."
                            : `Total: $${commissionTotal.toLocaleString()}`
                    }
                    accentColor="accent"
                    compact
                >
                    <CommissionDonutChart
                        segments={commissionSegments}
                        total={commissionTotal}
                        loading={commissionLoading}
                        height={200}
                    />
                </BaselChartCard>
            </div>

            {/* Row 2: Reputation radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <BaselChartCard
                    title="Reputation Score"
                    subtitle="Performance across five dimensions"
                    accentColor="secondary"
                    compact
                >
                    {reputationLoading ? (
                        <ChartLoadingState height={200} />
                    ) : (
                        <RadarChart
                            indicators={REPUTATION_INDICATORS}
                            series={radarSeries}
                            height={200}
                        />
                    )}
                </BaselChartCard>
            </div>
        </section>
    );
}
