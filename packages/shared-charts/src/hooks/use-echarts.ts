import { useEffect, useMemo, useState } from 'react';
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

/**
 * Provides ECharts theme options derived from DaisyUI CSS custom properties.
 *
 * Watches for theme changes (light ↔ dark) via MutationObserver on <html>
 * attributes (data-theme, class) so charts re-render with correct colors
 * when the user toggles the theme.
 */
export function useECharts(): UseEChartsResult {
    const isClient = typeof window !== 'undefined';
    const [themeVersion, setThemeVersion] = useState(0);

    // Watch for theme changes on <html> element
    useEffect(() => {
        if (!isClient) return;

        const observer = new MutationObserver(() => {
            setThemeVersion((v) => v + 1);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class', 'style'],
        });

        return () => observer.disconnect();
    }, [isClient]);

    const themeOptions = useMemo(() => {
        // themeVersion dependency forces re-evaluation on theme change
        void themeVersion;
        return getSplitsThemeOptions();
    }, [themeVersion]);

    const chartDefaults: EChartsDefaults = {
        notMerge: true,
        lazyUpdate: false,
        renderer: 'svg',
    };

    return { themeOptions, chartDefaults, isClient };
}
