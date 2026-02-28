'use client';

import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useECharts } from '../hooks/use-echarts';

export interface BarChartDataItem {
    label: string;
    value: number;
}

export interface BarChartProps {
    data: BarChartDataItem[];
    horizontal?: boolean;
    stacked?: boolean;
    height?: number;
    showLegend?: boolean;
    className?: string;
}

export const BarChart = memo(function BarChart({
    data,
    horizontal = false,
    stacked = false,
    height = 280,
    showLegend = false,
    className,
}: BarChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length) return null;

    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);

    const categoryAxis = {
        type: 'category',
        data: labels,
        ...themeOptions.categoryAxis,
    };
    const valueAxis = {
        type: 'value',
        ...themeOptions.valueAxis,
    };

    const option = {
        ...themeOptions,
        legend: showLegend ? { ...themeOptions.legend, show: true } : { show: false },
        tooltip: { ...themeOptions.tooltip, trigger: 'axis' },
        grid: { left: 48, right: 16, top: showLegend ? 36 : 16, bottom: 32, containLabel: false },
        xAxis: horizontal ? valueAxis : categoryAxis,
        yAxis: horizontal ? categoryAxis : valueAxis,
        series: [
            {
                type: 'bar',
                data: values,
                stack: stacked ? 'total' : undefined,
                itemStyle: themeOptions.bar?.itemStyle,
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
