"use client";

import { BarChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";

export interface PlacementTrendChartProps {
    data: { month: string; count: number }[];
    loading?: boolean;
    height?: number;
}

export function PlacementTrendChart({
    data,
    loading = false,
    height = 200,
}: PlacementTrendChartProps) {
    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!data.length) {
        return <ChartLoadingState height={height} message="No placement data" />;
    }

    const chartData = data.map((d) => ({ label: d.month, value: d.count }));

    return <BarChart data={chartData} height={height} />;
}
