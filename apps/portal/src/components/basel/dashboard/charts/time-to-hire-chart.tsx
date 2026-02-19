"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors, hexWithAlpha } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface TimeToHireChartProps {
    data: { role: string; avgDays: number; benchmark: number }[];
    loading?: boolean;
    height?: number;
}

export function TimeToHireChart({
    data,
    loading = false,
    height = 320,
}: TimeToHireChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!data.length) {
        return (
            <ChartLoadingState height={height} message="No time-to-hire data" />
        );
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
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 8, left: 80 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={hexWithAlpha(colors.baseContent, 0.08)}
                    horizontal={false}
                />
                <XAxis
                    type="number"
                    tick={axisTick}
                    axisLine={{ stroke: hexWithAlpha(colors.baseContent, 0.15) }}
                    tickLine={false}
                    label={{
                        value: "Days",
                        position: "insideBottomRight",
                        offset: -4,
                        style: {
                            fontSize: 10,
                            fill: hexWithAlpha(colors.baseContent, 0.5),
                        },
                    }}
                />
                <YAxis
                    type="category"
                    dataKey="role"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                />
                <Tooltip
                    content={
                        <BaselTooltip
                            formatter={(value, name) =>
                                `${value} day${value !== 1 ? "s" : ""}`
                            }
                        />
                    }
                    cursor={{ fill: hexWithAlpha(colors.baseContent, 0.04) }}
                />
                <Legend
                    iconType="square"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Bar
                    dataKey="avgDays"
                    name="Actual"
                    fill={colors.primary}
                    radius={[0, 0, 0, 0]}
                    barSize={10}
                />
                <Bar
                    dataKey="benchmark"
                    name="Benchmark"
                    fill={hexWithAlpha(colors.baseContent, 0.2)}
                    radius={[0, 0, 0, 0]}
                    barSize={10}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
