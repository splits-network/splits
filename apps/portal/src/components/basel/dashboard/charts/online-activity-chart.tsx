"use client";

import {
    AreaChart,
    Area,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors, hexWithAlpha } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface OnlineActivityChartProps {
    timeline: { minute: string; count: number }[];
    loading?: boolean;
    height?: number;
}

export function OnlineActivityChart({
    timeline,
    loading = false,
    height = 160,
}: OnlineActivityChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!timeline.length) {
        return <ChartLoadingState height={height} message="No activity data" />;
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart
                data={timeline}
                margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
                <YAxis
                    tick={{
                        fontSize: 9,
                        fill: hexWithAlpha(colors.baseContent, 0.5),
                        fontWeight: 500,
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    allowDecimals={false}
                    tickCount={3}
                />
                <Tooltip
                    content={
                        <BaselTooltip
                            formatter={(value) =>
                                `${value.toLocaleString()} online`
                            }
                        />
                    }
                />
                <Area
                    type="monotone"
                    dataKey="count"
                    name="Online"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill={colors.primary}
                    fillOpacity={0.12}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
