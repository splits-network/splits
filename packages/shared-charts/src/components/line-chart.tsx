'use client';

import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useECharts } from '../hooks/use-echarts';

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
        ? series.map((s) => ({
              name: s.name,
              type: 'line',
              data: s.data,
              smooth: s.smooth ?? smooth,
          }))
        : [
              {
                  type: 'line',
                  data: data?.map((d) => d.y) ?? [],
                  smooth,
              },
          ];

    const option = {
        ...themeOptions,
        legend: showLegend ? { ...themeOptions.legend, show: true } : { show: false },
        tooltip: { ...themeOptions.tooltip, trigger: 'axis' },
        grid: { left: 48, right: 16, top: showLegend ? 36 : 16, bottom: 32, containLabel: false },
        xAxis: {
            type: 'category',
            data: categories,
            name: xAxisLabel,
            ...themeOptions.categoryAxis,
        },
        yAxis: {
            type: 'value',
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
