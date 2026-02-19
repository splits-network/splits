"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors, hexWithAlpha } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface PlacementTrendChartProps {
    data: { month: string; count: number }[];
    loading?: boolean;
    height?: number;
}

export function PlacementTrendChart({
    data,
    loading = false,
    height = 320,
}: PlacementTrendChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!data.length) {
        return <ChartLoadingState height={height} message="No placement data" />;
    }

    const axisTick = {
        fontSize: 10,
        fill: hexWithAlpha(colors.baseContent, 0.6),
        fontWeight: 500 as const,
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={hexWithAlpha(colors.baseContent, 0.08)}
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
                    tick={axisTick}
                    axisLine={{ stroke: hexWithAlpha(colors.baseContent, 0.15) }}
                    tickLine={false}
                />
                <YAxis
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    content={<BaselTooltip />}
                    cursor={{ fill: hexWithAlpha(colors.baseContent, 0.04) }}
                />
                <Bar
                    dataKey="count"
                    name="Placements"
                    fill={colors.primary}
                    radius={[0, 0, 0, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
