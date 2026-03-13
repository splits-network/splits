"use client";

import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { useECharts } from "../hooks/use-echarts";

export interface FunnelChartDataItem {
    name: string;
    value: number;
}

export interface FunnelChartProps {
    data: FunnelChartDataItem[];
    height?: number;
    showLabels?: boolean;
    showLegend?: boolean;
    className?: string;
}

export const FunnelChart = memo(function FunnelChart({
    data,
    height = 280,
    showLabels = true,
    showLegend = false,
    className,
}: FunnelChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length) return null;

    const validData = data.filter(
        (d) => d && d.name && d.value !== undefined && d.value !== null,
    );
    if (validData.length === 0) return null;

    const option = {
        ...themeOptions,
        legend: showLegend
            ? { ...themeOptions.legend, show: true, bottom: 0 }
            : { show: false },
        tooltip: {
            ...themeOptions.tooltip,
            trigger: "item",
            formatter: "{b}: {c}",
        },
        series: [
            {
                type: "funnel",
                left: 48,
                right: 16,
                top: 16,
                bottom: showLegend ? 36 : 16,
                sort: "descending",
                gap: 2,
                data: validData,
                label: {
                    show: showLabels,
                    position: "inside",
                    color: "#fff",
                    fontSize: 12,
                    formatter: "{b}\n{c}",
                },
                itemStyle: {
                    borderWidth: 1,
                    borderColor: "transparent",
                },
                emphasis: {
                    label: { fontSize: 14 },
                },
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
