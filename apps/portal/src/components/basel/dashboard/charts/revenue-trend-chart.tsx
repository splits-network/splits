"use client";

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";
import { formatCurrency } from "./chart-utils";

export interface RevenueTrendChartProps {
    data: { month: string; revenue: number; placements: number }[];
    loading?: boolean;
    height?: number;
}

export function RevenueTrendChart({
    data,
    loading = false,
    height = 320,
}: RevenueTrendChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!data.length) {
        return <ChartLoadingState height={height} message="No revenue data" />;
    }

    const axisTick = {
        fontSize: 10,
        fill: "oklch(var(--bc) / 0.6)",
        fontWeight: 500 as const,
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
                data={data}
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--bc) / 0.08)"
                />
                <XAxis
                    dataKey="month"
                    tick={axisTick}
                    axisLine={{ stroke: "oklch(var(--bc) / 0.15)" }}
                    tickLine={false}
                />
                <YAxis
                    yAxisId="revenue"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatCurrency(v)}
                />
                <YAxis
                    yAxisId="placements"
                    orientation="right"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    content={
                        <BaselTooltip
                            formatter={(value, name) =>
                                name === "Revenue"
                                    ? formatCurrency(value)
                                    : value.toLocaleString()
                            }
                        />
                    }
                />
                <Legend
                    iconType="plainline"
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill={colors.primary}
                    fillOpacity={0.08}
                />
                <Line
                    yAxisId="placements"
                    type="monotone"
                    dataKey="placements"
                    name="Placements"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
