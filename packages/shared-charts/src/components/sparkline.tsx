'use client';

import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useECharts } from '../hooks/use-echarts';

export interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    type?: 'line' | 'bar';
    className?: string;
}

export const Sparkline = memo(function Sparkline({
    data,
    width = 80,
    height = 24,
    color,
    type = 'line',
    className,
}: SparklineProps) {
    const { themeOptions, chartDefaults } = useECharts();

    if (!data?.length) return null;

    const seriesColor = color ?? themeOptions.color?.[0];

    const option = {
        animation: false,
        grid: { top: 0, bottom: 0, left: 0, right: 0 },
        xAxis: { type: 'category', show: false, boundaryGap: type === 'bar' },
        yAxis: { type: 'value', show: false },
        series: [
            {
                type,
                data,
                smooth: type === 'line',
                symbol: 'none',
                lineStyle: type === 'line' ? { color: seriesColor, width: 1.5 } : undefined,
                itemStyle: { color: seriesColor },
                areaStyle: type === 'line' ? { color: seriesColor, opacity: 0.15 } : undefined,
                barMaxWidth: 4,
            },
        ],
    };

    return (
        <div className={className} style={{ display: 'inline-block', width, height }}>
            <ReactECharts
                option={option}
                style={{ width, height }}
                opts={{ renderer: chartDefaults.renderer, width, height }}
                notMerge={chartDefaults.notMerge}
            />
        </div>
    );
});
