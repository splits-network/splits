"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors, hexWithAlpha } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface ApplicationVolumeChartProps {
    data: { period: string; count: number }[];
    loading?: boolean;
    height?: number;
}

export function ApplicationVolumeChart({
    data,
    loading = false,
    height = 320,
}: ApplicationVolumeChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!data.length) {
        return <ChartLoadingState height={height} message="No application data" />;
    }

    const axisTick = {
        fontSize: 10,
        fill: hexWithAlpha(colors.baseContent, 0.6),
        fontWeight: 500 as const,
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart
                data={data}
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={hexWithAlpha(colors.baseContent, 0.08)}
                />
                <XAxis
                    dataKey="period"
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
                <Tooltip content={<BaselTooltip />} />
                <Area
                    type="monotone"
                    dataKey="count"
                    name="Applications"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill={colors.primary}
                    fillOpacity={0.08}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
