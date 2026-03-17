"use client";

import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { useECharts } from "../hooks/use-echarts";

export interface RadarChartIndicator {
    name: string;
    max: number;
}

export interface RadarChartSeries {
    name?: string;
    data: number[];
}

export interface RadarChartProps {
    indicators: RadarChartIndicator[];
    series: RadarChartSeries[];
    height?: number;
    showLegend?: boolean;
    className?: string;
}

export const RadarChart = memo(function RadarChart({
    indicators,
    series,
    height = 280,
    showLegend = false,
    className,
}: RadarChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!indicators?.length || !series?.length) return null;

    const colors = themeOptions.color as string[];

    const option = {
        ...themeOptions,
        legend: showLegend
            ? { ...themeOptions.legend, show: true, bottom: 0 }
            : { show: false },
        tooltip: {
            ...themeOptions.tooltip,
            trigger: "item",
        },
        radar: {
            indicator: indicators,
            shape: "polygon",
            axisName: {
                color: themeOptions.textStyle?.color,
                fontSize: 11,
            },
            axisLine: {
                lineStyle: {
                    color: themeOptions.categoryAxis?.splitLine?.lineStyle?.color ?? "#e4e4e7",
                    opacity: 0.5,
                },
            },
            splitLine: {
                lineStyle: {
                    color: themeOptions.categoryAxis?.splitLine?.lineStyle?.color ?? "#e4e4e7",
                    opacity: 0.3,
                },
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ["transparent", "rgba(128,128,128,0.03)"],
                },
            },
        },
        series: [
            {
                type: "radar",
                data: series.map((s, i) => ({
                    value: s.data,
                    name: s.name ?? "",
                    areaStyle: {
                        color: colors?.[i % colors.length],
                        opacity: 0.15,
                    },
                    lineStyle: {
                        color: colors?.[i % colors.length],
                        width: 2,
                    },
                    itemStyle: {
                        color: colors?.[i % colors.length],
                    },
                })),
            },
        ],
    };

    return (
        <div className={className}>
            <ReactECharts
                option={option}
                style={{ height }}
                opts={{ renderer: chartDefaults.renderer }}
                notMerge={chartDefaults.notMerge}
            />
        </div>
    );
});
