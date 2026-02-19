"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Cell,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors, getSeriesColors } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface PipelineFunnelChartProps {
    stages: { label: string; count: number }[];
    loading?: boolean;
    height?: number;
}

export function PipelineFunnelChart({
    stages,
    loading = false,
    height = 320,
}: PipelineFunnelChartProps) {
    const colors = useBaselChartColors();
    const seriesColors = getSeriesColors(colors);

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!stages.length) {
        return <ChartLoadingState height={height} message="No pipeline data" />;
    }

    // Build data with conversion rates
    const data = stages.map((stage, i) => ({
        label: stage.label,
        count: stage.count,
        conversion:
            i > 0 && stages[i - 1].count > 0
                ? `${((stage.count / stages[i - 1].count) * 100).toFixed(0)}%`
                : "",
    }));

    const axisTick = {
        fontSize: 10,
        fill: "oklch(var(--bc) / 0.6)",
        fontWeight: 500 as const,
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 60, bottom: 8, left: 80 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--bc) / 0.08)"
                    horizontal={false}
                />
                <XAxis
                    type="number"
                    tick={axisTick}
                    axisLine={{ stroke: "oklch(var(--bc) / 0.15)" }}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="label"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                />
                <Tooltip
                    content={<BaselTooltip />}
                    cursor={{ fill: "oklch(var(--bc) / 0.04)" }}
                />
                <Bar dataKey="count" name="Candidates" radius={[0, 0, 0, 0]}>
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={seriesColors[index % seriesColors.length]}
                        />
                    ))}
                    <LabelList
                        dataKey="count"
                        position="right"
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "oklch(var(--bc) / 0.8)",
                        }}
                        formatter={(value) => typeof value === "number" ? value.toLocaleString() : String(value ?? "")}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
