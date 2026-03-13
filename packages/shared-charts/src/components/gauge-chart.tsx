"use client";

import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { useECharts } from "../hooks/use-echarts";

export interface GaugeChartProps {
    value: number;
    max?: number;
    label?: string;
    height?: number;
    className?: string;
}

export const GaugeChart = memo(function GaugeChart({
    value,
    max = 100,
    label,
    height = 200,
    className,
}: GaugeChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    const colors = themeOptions.color as string[];
    const primary = colors?.[0] ?? "#233876";

    const option = {
        ...themeOptions,
        series: [
            {
                type: "gauge",
                min: 0,
                max,
                progress: { show: true, width: 14, itemStyle: { color: primary } },
                axisLine: { lineStyle: { width: 14, color: [[1, themeOptions.categoryAxis?.splitLine?.lineStyle?.color ?? "#e4e4e7"]] } },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                pointer: { show: false },
                anchor: { show: false },
                title: {
                    show: !!label,
                    offsetCenter: [0, "70%"],
                    fontSize: 12,
                    color: themeOptions.textStyle?.color,
                },
                detail: {
                    valueAnimation: true,
                    offsetCenter: [0, "0%"],
                    fontSize: 28,
                    fontWeight: "bold",
                    color: themeOptions.textStyle?.color,
                    formatter: "{value}",
                },
                data: [{ value, name: label ?? "" }],
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
