'use client';

import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useECharts } from '../hooks/use-echarts';

export interface AreaChartSeries {
    name: string;
    data: number[];
}

export interface AreaChartProps {
    data?: { x: string; y: number }[];
    series?: AreaChartSeries[];
    xLabels?: string[];
    height?: number;
    showLegend?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    smooth?: boolean;
    gradient?: boolean;
    className?: string;
}

export const AreaChart = memo(function AreaChart({
    data,
    series,
    xLabels,
    height = 280,
    showLegend = false,
    xAxisLabel,
    yAxisLabel,
    smooth = true,
    gradient = true,
    className,
}: AreaChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length && !series?.length) return null;

    const categories = xLabels ?? data?.map((d) => d.x) ?? [];

    const buildAreaStyle = (colorIndex: number) => {
        const color = themeOptions.color?.[colorIndex] ?? themeOptions.color?.[0];
        if (!gradient) return { opacity: 0.3 };
        return {
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    { offset: 0, color: color ?? 'currentColor' },
                    { offset: 1, color: 'transparent' },
                ],
            },
            opacity: 0.4,
        };
    };

    const seriesList = series
        ? series.map((s, i) => ({
              name: s.name,
              type: 'line',
              data: s.data,
              smooth,
              areaStyle: buildAreaStyle(i),
          }))
        : [
              {
                  type: 'line',
                  data: data?.map((d) => d.y) ?? [],
                  smooth,
                  areaStyle: buildAreaStyle(0),
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
            boundaryGap: false,
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
