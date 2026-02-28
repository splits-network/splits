import { useMemo } from 'react';
import { getSplitsThemeOptions } from '../theme';

export interface EChartsDefaults {
    notMerge?: boolean;
    lazyUpdate?: boolean;
    renderer?: 'svg' | 'canvas';
}

export interface UseEChartsResult {
    themeOptions: ReturnType<typeof getSplitsThemeOptions>;
    chartDefaults: EChartsDefaults;
    isClient: boolean;
}

export function useECharts(): UseEChartsResult {
    const isClient = typeof window !== 'undefined';

    const themeOptions = useMemo(() => {
        if (!isClient) return getSplitsThemeOptions();
        return getSplitsThemeOptions();
    }, [isClient]);

    const chartDefaults: EChartsDefaults = {
        notMerge: true,
        lazyUpdate: false,
        renderer: 'svg',
    };

    return { themeOptions, chartDefaults, isClient };
}
