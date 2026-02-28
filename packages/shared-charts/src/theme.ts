/**
 * ECharts theme that reads DaisyUI CSS custom properties at runtime.
 * DaisyUI v5 uses oklch color format.
 */

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
    baseContent: string;
    baseBorder: string;
    palette: string[];
}

function resolveCssVar(varName: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value ? `oklch(${value})` : fallback;
}

export function getThemeColors(): ThemeColors {
    const primary = resolveCssVar('--p', 'oklch(0.5 0.2 250)');
    const secondary = resolveCssVar('--s', 'oklch(0.6 0.15 280)');
    const accent = resolveCssVar('--a', 'oklch(0.7 0.2 180)');
    const success = resolveCssVar('--su', 'oklch(0.65 0.2 140)');
    const warning = resolveCssVar('--wa', 'oklch(0.75 0.2 80)');
    const error = resolveCssVar('--er', 'oklch(0.6 0.25 20)');
    const neutral = resolveCssVar('--n', 'oklch(0.4 0.02 250)');
    const baseContent = resolveCssVar('--bc', 'oklch(0.2 0.02 250)');
    const baseBorder = resolveCssVar('--b3', 'oklch(0.85 0.01 250)');

    return {
        primary,
        secondary,
        accent,
        success,
        warning,
        error,
        neutral,
        baseContent,
        baseBorder,
        palette: [primary, secondary, accent, success, warning, error],
    };
}

export function getSplitsThemeOptions() {
    const colors = getThemeColors();

    return {
        color: colors.palette,
        backgroundColor: 'transparent',
        textStyle: {
            color: colors.baseContent,
            fontFamily: 'inherit',
            fontSize: 12,
        },
        title: {
            textStyle: {
                color: colors.baseContent,
                fontFamily: 'inherit',
            },
        },
        legend: {
            textStyle: {
                color: colors.baseContent,
            },
        },
        tooltip: {
            backgroundColor: 'oklch(0.2 0.02 250)',
            borderColor: colors.baseBorder,
            textStyle: {
                color: 'oklch(0.95 0.01 250)',
            },
        },
        categoryAxis: {
            axisLine: { lineStyle: { color: colors.baseBorder } },
            axisTick: { lineStyle: { color: colors.baseBorder } },
            axisLabel: { color: colors.baseContent },
            splitLine: { lineStyle: { color: colors.baseBorder, opacity: 0.5 } },
        },
        valueAxis: {
            axisLine: { lineStyle: { color: colors.baseBorder } },
            axisTick: { lineStyle: { color: colors.baseBorder } },
            axisLabel: { color: colors.baseContent },
            splitLine: { lineStyle: { color: colors.baseBorder, opacity: 0.5 } },
        },
        line: {
            itemStyle: { borderWidth: 2 },
            lineStyle: { width: 2 },
            symbolSize: 6,
            smooth: false,
        },
        bar: {
            itemStyle: { borderRadius: 4 },
        },
        pie: {
            itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        },
    };
}
