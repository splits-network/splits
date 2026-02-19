"use client";

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { useBaselChartColors } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface MarketplaceHealthChartProps {
    metrics: { metric: string; value: number }[];
    overallScore?: number;
    loading?: boolean;
    height?: number;
}

export function MarketplaceHealthChart({
    metrics,
    loading = false,
    height = 320,
}: MarketplaceHealthChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!metrics.length) {
        return <ChartLoadingState height={height} message="No health data" />;
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={metrics} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="oklch(var(--bc) / 0.1)" />
                <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                        fontSize: 10,
                        fontWeight: 500,
                        fill: "oklch(var(--bc) / 0.6)",
                    }}
                />
                <PolarRadiusAxis
                    tick={{
                        fontSize: 9,
                        fill: "oklch(var(--bc) / 0.4)",
                    }}
                    axisLine={false}
                    tickCount={4}
                />
                <Tooltip content={<BaselTooltip />} />
                <Radar
                    name="Health"
                    dataKey="value"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill={colors.primary}
                    fillOpacity={0.15}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
