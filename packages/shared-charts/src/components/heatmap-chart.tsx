"use client";

import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { useECharts } from "../hooks/use-echarts";

export interface HeatmapDataItem {
    date: string;
    value: number;
}

export interface HeatmapChartProps {
    data: HeatmapDataItem[];
    height?: number;
    className?: string;
}

export const HeatmapChart = memo(function HeatmapChart({
    data,
    height = 160,
    className,
}: HeatmapChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length) return null;

    const validData = data.filter(
        (d) => d && d.date && d.value !== undefined && d.value !== null,
    );
    if (validData.length === 0) return null;

    const colors = themeOptions.color as string[];
    const primary = colors?.[0] ?? "#233876";
    const maxVal = Math.max(...validData.map((d) => d.value), 1);

    // Build calendar-style heatmap: [weekIndex, dayOfWeek, value]
    // Fill ALL days in range so every cell renders (zeros = lightest color)
    const sorted = [...validData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const startDate = new Date(sorted[0].date);
    const endDate = new Date(sorted[sorted.length - 1].date);

    // Build lookup of date → value
    const valueMap = new Map<string, number>();
    for (const d of validData) {
        valueMap.set(d.date, d.value);
    }

    // Generate entries for every day from start to end
    const heatData: [number, number, number][] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
        const dayOfWeek = cursor.getDay();
        const diffDays = Math.floor(
            (cursor.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const weekIndex = Math.floor(
            (diffDays + startDate.getDay()) / 7,
        );
        const dateStr = cursor.toISOString().split("T")[0];
        heatData.push([weekIndex, dayOfWeek, valueMap.get(dateStr) ?? 0]);
        cursor.setDate(cursor.getDate() + 1);
    }

    const totalWeeks =
        heatData.length > 0
            ? Math.max(...heatData.map((d) => d[0])) + 1
            : 1;

    const option = {
        ...themeOptions,
        tooltip: {
            ...themeOptions.tooltip,
            formatter: (params: { value: [number, number, number] }) => {
                const [, , val] = params.value;
                return `${val} submission${val !== 1 ? "s" : ""}`;
            },
        },
        grid: { left: 32, right: 8, top: 8, bottom: 8 },
        xAxis: {
            type: "category",
            data: Array.from({ length: totalWeeks }, (_, i) => i),
            show: false,
        },
        yAxis: {
            type: "category",
            data: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                fontSize: 10,
                color: themeOptions.textStyle?.color,
            },
        },
        visualMap: {
            min: 0,
            max: maxVal,
            show: false,
            inRange: {
                color: [
                    themeOptions.categoryAxis?.splitLine?.lineStyle?.color ??
                        "#e4e4e7",
                    primary,
                ],
            },
        },
        series: [
            {
                type: "heatmap",
                data: heatData,
                itemStyle: { borderRadius: 2, borderWidth: 2, borderColor: "transparent" },
            },
        ],
    };

    return (
        <div className={`h-full ${className || ""}`}>
            <ReactECharts
                option={option}
                style={{ height: "100%", minHeight: height }}
                opts={{ renderer: chartDefaults.renderer }}
                notMerge={chartDefaults.notMerge}
            />
        </div>
    );
});
