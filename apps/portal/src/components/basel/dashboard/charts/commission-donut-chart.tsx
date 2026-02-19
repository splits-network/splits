"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors, getSeriesColors } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";
import { formatCurrency } from "./chart-utils";

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
    height = 320,
}: CommissionDonutChartProps) {
    const colors = useBaselChartColors();
    const seriesColors = getSeriesColors(colors);

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!segments.length) {
        return <ChartLoadingState height={height} message="No commission data" />;
    }

    const data = segments.map((s) => ({
        name: s.role,
        value: s.amount,
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    cornerRadius={0}
                    stroke="oklch(var(--b1))"
                    strokeWidth={1}
                >
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={seriesColors[index % seriesColors.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    content={
                        <BaselTooltip
                            formatter={(value) => formatCurrency(value)}
                        />
                    }
                />
                <Legend
                    verticalAlign="bottom"
                    iconType="square"
                    iconSize={8}
                    formatter={(value: string, entry) => {
                        const segment = segments.find((s) => s.role === value);
                        return (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "oklch(var(--bc) / 0.7)",
                                }}
                            >
                                {value}
                                {segment && (
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            marginLeft: 4,
                                            color: entry.color,
                                        }}
                                    >
                                        {formatCurrency(segment.amount)}
                                    </span>
                                )}
                            </span>
                        );
                    }}
                />
                {/* Center label */}
                <text
                    x="50%"
                    y="43%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        fill: "oklch(var(--bc))",
                    }}
                >
                    {formatCurrency(total)}
                </text>
                <text
                    x="50%"
                    y="51%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                        fontSize: 9,
                        fontWeight: 500,
                        fill: "oklch(var(--bc) / 0.5)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                    }}
                >
                    TOTAL
                </text>
            </PieChart>
        </ResponsiveContainer>
    );
}
