"use client";

import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { useECharts } from "../hooks/use-echarts";

export interface LineChartSeries {
    name: string;
    data: number[];
    smooth?: boolean;
}

export interface LineChartProps {
    data?: { x: string; y: number }[];
    series?: LineChartSeries[];
    xLabels?: string[];
    height?: number;
    showLegend?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    smooth?: boolean;
    className?: string;
}

export const LineChart = memo(function LineChart({
    data,
    series,
    xLabels,
    height = 280,
    showLegend = false,
    xAxisLabel,
    yAxisLabel,
    smooth = false,
    className,
}: LineChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length && !series?.length) return null;

    const categories = xLabels ?? data?.map((d) => d.x) ?? [];
    const seriesList = series
        ? series
              .filter((s) => s && Array.isArray(s.data) && s.data.length > 0)
              .map((s) => ({
                  name: s.name,
                  type: "line",
                  data: s.data.filter((v) => v !== undefined && v !== null),
                  smooth: s.smooth ?? smooth,
              }))
        : [
              {
                  type: "line",
                  data:
                      data
                          ?.map((d) => d.y)
                          .filter((v) => v !== undefined && v !== null) ?? [],
                  smooth,
              },
          ];

    // Don't render if all series are empty after filtering
    if (
        seriesList.length === 0 ||
        seriesList.every((s) => !s.data || s.data.length === 0)
    ) {
        return null;
    }

    const option = {
        ...themeOptions,
        legend: showLegend
            ? { ...themeOptions.legend, show: true }
            : { show: false },
        tooltip: { ...themeOptions.tooltip, trigger: "axis" },
        grid: {
            left: 48,
            right: 16,
            top: showLegend ? 36 : 16,
            bottom: 32,
            containLabel: false,
        },
        xAxis: {
            type: "category",
            data: categories,
            name: xAxisLabel,
            ...themeOptions.categoryAxis,
        },
        yAxis: {
            type: "value",
            name: yAxisLabel,
            ...themeOptions.valueAxis,
        },
        series: seriesList,
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
