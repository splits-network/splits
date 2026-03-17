/**
 * ECharts theme that reads DaisyUI v5 CSS custom properties at runtime.
 *
 * DaisyUI v5 uses `--color-*` variable names. Values may be hex (#233876)
 * or oklch(). We read the computed value directly — no wrapping needed.
 */

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    info: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
    baseContent: string;
    base200: string;
    base300: string;
    palette: string[];
}

/**
 * Read a CSS custom property from :root, returning the computed value as-is.
 * Works with hex, oklch, rgb, hsl — whatever DaisyUI emits.
 */
function resolveCssVar(varName: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    return value || fallback;
}

export function getThemeColors(): ThemeColors {
    const primary = resolveCssVar('--color-primary', '#233876');
    const secondary = resolveCssVar('--color-secondary', '#0f9d8a');
    const accent = resolveCssVar('--color-accent', '#db2777');
    const info = resolveCssVar('--color-info', '#0ea5e9');
    const success = resolveCssVar('--color-success', '#16a34a');
    const warning = resolveCssVar('--color-warning', '#d97706');
    const error = resolveCssVar('--color-error', '#ef4444');
    const neutral = resolveCssVar('--color-neutral', '#18181b');
    const baseContent = resolveCssVar('--color-base-content', '#18181b');
    const base200 = resolveCssVar('--color-base-200', '#f4f4f5');
    const base300 = resolveCssVar('--color-base-300', '#e4e4e7');

    return {
        primary,
        secondary,
        accent,
        info,
        success,
        warning,
        error,
        neutral,
        baseContent,
        base200,
        base300,
        palette: [primary, secondary, accent, info, success, warning, error],
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
            backgroundColor: colors.neutral,
            borderColor: colors.base300,
            textStyle: {
                color: '#f9fafb',
            },
        },
        categoryAxis: {
            axisLine: { lineStyle: { color: colors.base300 } },
            axisTick: { lineStyle: { color: colors.base300 } },
            axisLabel: { color: colors.baseContent },
            splitLine: { lineStyle: { color: colors.base300, opacity: 0.5 } },
        },
        valueAxis: {
            axisLine: { lineStyle: { color: colors.base300 } },
            axisTick: { lineStyle: { color: colors.base300 } },
            axisLabel: { color: colors.baseContent },
            splitLine: { lineStyle: { color: colors.base300, opacity: 0.5 } },
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
