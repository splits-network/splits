"use client";

import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { useECharts } from "../hooks/use-echarts";

export interface StackedBarChartSeries {
    name: string;
    data: number[];
}

export interface StackedBarChartProps {
    series: StackedBarChartSeries[];
    categories: string[];
    height?: number;
    horizontal?: boolean;
    showLegend?: boolean;
    className?: string;
}

export const StackedBarChart = memo(function StackedBarChart({
    series,
    categories,
    height = 280,
    horizontal = false,
    showLegend = true,
    className,
}: StackedBarChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!series?.length || !categories?.length) return null;

    const categoryAxis = {
        type: "category" as const,
        data: categories,
        ...themeOptions.categoryAxis,
    };
    const valueAxis = {
        type: "value" as const,
        ...themeOptions.valueAxis,
    };

    const option = {
        ...themeOptions,
        legend: showLegend
            ? { ...themeOptions.legend, show: true, bottom: 0 }
            : { show: false },
        tooltip: {
            ...themeOptions.tooltip,
            trigger: "axis",
        },
        grid: {
            left: 48,
            right: 16,
            top: showLegend ? 16 : 16,
            bottom: showLegend ? 36 : 32,
            containLabel: false,
        },
        xAxis: horizontal ? valueAxis : categoryAxis,
        yAxis: horizontal ? categoryAxis : valueAxis,
        series: series.map((s) => ({
            type: "bar",
            name: s.name,
            data: s.data,
            stack: "total",
            itemStyle: themeOptions.bar?.itemStyle,
        })),
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
