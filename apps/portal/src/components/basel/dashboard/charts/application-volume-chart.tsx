"use client";

import { AreaChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";

export interface ApplicationVolumeChartProps {
    data: { period: string; count: number }[];
    loading?: boolean;
    height?: number;
}

export function ApplicationVolumeChart({
    data,
    loading = false,
    height = 200,
}: ApplicationVolumeChartProps) {
    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!data.length) {
        return (
            <div
                className="flex items-center justify-center text-base-content/50 text-sm"
                style={{ height }}
            >
                No application data available
            </div>
        );
    }

    const chartData = data.map((d) => ({ x: d.period, y: d.count }));

    return <AreaChart data={chartData} height={height} smooth gradient />;
}
