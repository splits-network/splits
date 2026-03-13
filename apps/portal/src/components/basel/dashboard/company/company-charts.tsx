"use client";

import dynamic from "next/dynamic";
import {
    BaselChartCard,
    BaselSectionHeading,
} from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { RadarChart } from "@splits-network/shared-charts";
import { CompanyStageBreakdownTable } from "./company-stage-breakdown-table";
import type { CompanyHealthMetrics } from "@/app/portal/dashboard/hooks/use-company-health";
import type { HiringStage } from "@/app/portal/dashboard/hooks/use-hiring-pipeline";
import type { ApplicationVolumePoint } from "@/app/portal/dashboard/hooks/use-application-volume";

const PipelineFunnelChart = dynamic(
    () =>
        import(
            "@/components/basel/dashboard/charts/pipeline-funnel-chart"
        ).then((m) => ({ default: m.PipelineFunnelChart })),
    { loading: () => <ChartLoadingState height={200} /> },
);

const ApplicationVolumeChart = dynamic(
    () =>
        import(
            "@/components/basel/dashboard/charts/application-volume-chart"
        ).then((m) => ({ default: m.ApplicationVolumeChart })),
    { loading: () => <ChartLoadingState height={200} /> },
);

interface CompanyChartsProps {
    stages: HiringStage[];
    pipelineLoading: boolean;
    healthMetrics: CompanyHealthMetrics;
    healthLoading: boolean;
    applicationVolumeData: ApplicationVolumePoint[];
    applicationVolumeLoading: boolean;
}

const HEALTH_INDICATORS = [
    { name: "Time to Fill", max: 100 },
    { name: "Candidate Flow", max: 100 },
    { name: "Interview Rate", max: 100 },
    { name: "Offer Rate", max: 100 },
    { name: "Fill Rate", max: 100 },
];

export function CompanyCharts({
    stages,
    pipelineLoading,
    healthMetrics,
    healthLoading,
    applicationVolumeData,
    applicationVolumeLoading,
}: CompanyChartsProps) {
    const radarSeries = [
        {
            name: "Health",
            data: [
                healthMetrics.timeToFill,
                healthMetrics.candidateFlow,
                healthMetrics.interviewRate,
                healthMetrics.offerRate,
                healthMetrics.fillRate,
            ],
        },
    ];

    return (
        <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6 space-y-4">
            <BaselSectionHeading
                kicker="ANALYTICS"
                title="Hiring Performance"
                className="section-heading mb-4"
            />

            {/* Row 1: Funnel chart + Stage breakdown table (GA-style chart+table pair) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BaselChartCard
                    title="Hiring Funnel"
                    subtitle="Candidates by pipeline stage"
                    accentColor="primary"
                    compact
                >
                    <PipelineFunnelChart
                        stages={stages}
                        loading={pipelineLoading}
                        height={200}
                    />
                </BaselChartCard>

                <CompanyStageBreakdownTable
                    stages={stages}
                    loading={pipelineLoading}
                />
            </div>

            {/* Row 2: Health Radar + App Volume (2-col) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BaselChartCard
                    title="Hiring Health"
                    subtitle="Efficiency across five dimensions"
                    accentColor="secondary"
                    compact
                >
                    {healthLoading ? (
                        <ChartLoadingState height={200} />
                    ) : (
                        <RadarChart
                            indicators={HEALTH_INDICATORS}
                            series={radarSeries}
                            height={200}
                        />
                    )}
                </BaselChartCard>

                <BaselChartCard
                    title="Application Volume"
                    subtitle="Inbound candidates per month"
                    accentColor="accent"
                    compact
                >
                    <ApplicationVolumeChart
                        data={applicationVolumeData}
                        loading={applicationVolumeLoading}
                        height={200}
                    />
                </BaselChartCard>
            </div>
        </section>
    );
}
