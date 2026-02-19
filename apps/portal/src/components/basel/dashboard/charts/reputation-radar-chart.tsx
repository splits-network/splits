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
import { useBaselChartColors, hexWithAlpha } from "./use-basel-chart-colors";
import { BaselTooltip } from "./basel-tooltip";

export interface ReputationRadarChartProps {
    metrics: {
        speed: number;
        volume: number;
        quality: number;
        collaboration: number;
        consistency: number;
    };
    loading?: boolean;
    height?: number;
}

function toRadarData(metrics: ReputationRadarChartProps["metrics"]) {
    return [
        { metric: "Speed", value: metrics.speed },
        { metric: "Volume", value: metrics.volume },
        { metric: "Quality", value: metrics.quality },
        { metric: "Collaboration", value: metrics.collaboration },
        { metric: "Consistency", value: metrics.consistency },
    ];
}

export function ReputationRadarChart({
    metrics,
    loading = false,
    height = 200,
}: ReputationRadarChartProps) {
    const colors = useBaselChartColors();

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    const data = toRadarData(metrics);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={hexWithAlpha(colors.baseContent, 0.1)} />
                <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                        fontSize: 10,
                        fontWeight: 500,
                        fill: hexWithAlpha(colors.baseContent, 0.6),
                    }}
                />
                <PolarRadiusAxis
                    tick={{
                        fontSize: 9,
                        fill: hexWithAlpha(colors.baseContent, 0.4),
                    }}
                    axisLine={false}
                    tickCount={4}
                />
                <Tooltip content={<BaselTooltip />} />
                <Radar
                    name="Reputation"
                    dataKey="value"
                    stroke={colors.accent}
                    strokeWidth={2}
                    fill={colors.accent}
                    fillOpacity={0.15}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
