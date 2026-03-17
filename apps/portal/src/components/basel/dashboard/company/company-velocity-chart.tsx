"use client";

import { BaselChartCard } from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import dynamic from "next/dynamic";

const PlacementTrendChart = dynamic(
    () =>
        import(
            "@/components/basel/dashboard/charts/placement-trend-chart"
        ).then((m) => ({ default: m.PlacementTrendChart })),
    { loading: () => <ChartLoadingState height={200} /> },
);

interface CompanyVelocityChartProps {
    data: { month: string; count: number }[];
    loading: boolean;
}

export function CompanyVelocityChart({
    data,
    loading,
}: CompanyVelocityChartProps) {
    return (
        <BaselChartCard
            title="Hiring Velocity"
            subtitle="Placements per month"
            accentColor="success"
            compact
        >
            <PlacementTrendChart
                data={data}
                loading={loading}
                height={200}
            />
        </BaselChartCard>
    );
}
