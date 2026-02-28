'use client';

import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useECharts } from '../hooks/use-echarts';

export interface PieChartDataItem {
    name: string;
    value: number;
}

export interface PieChartProps {
    data: PieChartDataItem[];
    donut?: boolean;
    height?: number;
    showLabels?: boolean;
    showLegend?: boolean;
    className?: string;
}

export const PieChart = memo(function PieChart({
    data,
    donut = false,
    height = 280,
    showLabels = true,
    showLegend = true,
    className,
}: PieChartProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length) return null;

    const radius = donut ? ['40%', '70%'] : ['0%', '70%'];

    const option = {
        ...themeOptions,
        legend: showLegend
            ? { ...themeOptions.legend, show: true, orient: 'horizontal', bottom: 0 }
            : { show: false },
        tooltip: {
            ...themeOptions.tooltip,
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        series: [
            {
                type: 'pie',
                radius,
                data,
                label: {
                    show: showLabels,
                    color: themeOptions.textStyle?.color,
                    formatter: '{b}: {d}%',
                },
                itemStyle: themeOptions.pie?.itemStyle,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                    },
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
