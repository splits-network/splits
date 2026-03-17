"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { StackedBarChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { StageBottleneck } from "@/app/portal/dashboard/hooks/use-pipeline-bottleneck";

interface CompanyBottleneckProps {
    stages: StageBottleneck[];
    loading: boolean;
}

export function CompanyBottleneck({ stages, loading }: CompanyBottleneckProps) {
    if (loading) {
        return (
            <BaselChartCard
                title="Pipeline Bottleneck"
                subtitle="Where candidates spend the most time"
                accentColor="warning"
                compact
            >
                <ChartLoadingState height={200} />
            </BaselChartCard>
        );
    }

    if (stages.length === 0) {
        return (
            <BaselChartCard
                title="Pipeline Bottleneck"
                subtitle="Where candidates spend the most time"
                accentColor="warning"
                compact
            >
                <p className="text-sm text-base-content/40 py-8 text-center">
                    No pipeline data available yet.
                </p>
            </BaselChartCard>
        );
    }

    const categories = stages.map((s) => s.stage);

    return (
        <BaselChartCard
            title="Pipeline Bottleneck"
            subtitle="Candidate count and avg days at each stage"
            accentColor="warning"
            compact
        >
            <StackedBarChart
                categories={categories}
                series={[
                    {
                        name: "Candidates",
                        data: stages.map((s) => s.count),
                    },
                    {
                        name: "Avg Days in Stage",
                        data: stages.map((s) => s.avgDaysInStage),
                    },
                ]}
                height={200}
                horizontal
                showLegend
            />
        </BaselChartCard>
    );
}
