"use client";

import { PieChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";

export interface CommissionDonutChartProps {
    segments: { role: string; amount: number }[];
    total: number;
    loading?: boolean;
    height?: number;
}

export function CommissionDonutChart({
    segments,
    total,
    loading = false,
    height = 200,
}: CommissionDonutChartProps) {
    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!segments.length) {
        return <ChartLoadingState height={height} message="No commission data" />;
    }

    const data = segments.map((s) => ({ name: s.role, value: s.amount }));

    return <PieChart data={data} donut height={height} showLegend />;
}
