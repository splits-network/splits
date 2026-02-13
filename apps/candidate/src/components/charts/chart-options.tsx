export function getCssVar(name: string, el?: HTMLElement) {
    if (typeof document === 'undefined') {
        return '#000000'; // Fallback for SSR
    }
    const element = el || document.documentElement;
    return getComputedStyle(element).getPropertyValue(name).trim();
}

function hexToRgba(hex: string, a = 1) {
    const h = hex.replace("#", "").trim();
    const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Initialize color values on first client-side call
let colorCache: Record<string, string> = {};
function getColorCache() {
    if (typeof document === 'undefined' || Object.keys(colorCache).length === 0) {
        // SSR or initial load - set defaults
        if (typeof document === 'undefined') {

            return {
                primaryHex: '#233876',
                secondaryHex: '#0f9d8a',
                accentHex: '#db2777',
                neutralHex: '#888888',
                infoHex: '#0ea5e9',
                successHex: '#16a34a',
                warningHex: '#d97706',
                errorHex: '#ef4444',
                base100Hex: '#ffffff',
                base200Hex: '#f4f4f5',
                base300Hex: '#e4e4e7',
                baseContentHex: '#18181b',
            };
        }
        // Client-side: read actual colors
        colorCache = {
            primaryHex: getCssVar("--color-primary"),
            secondaryHex: getCssVar("--color-secondary"),
            accentHex: getCssVar("--color-accent"),
            neutralHex: getCssVar("--color-neutral"),
            infoHex: getCssVar("--color-info"),
            successHex: getCssVar("--color-success"),
            warningHex: getCssVar("--color-warning"),
            errorHex: getCssVar("--color-error"),
            base100Hex: getCssVar("--color-base-100"),
            base200Hex: getCssVar("--color-base-200"),
            base300Hex: getCssVar("--color-base-300"),
            baseContentHex: getCssVar("--color-base-content"),
        };
    }
    return colorCache;
}

export const dataset = (() => {
    const colors = getColorCache();
    return {
        primaryBorderColor: colors.primaryHex,                 // solid line
        primaryBackgroundColor: hexToRgba(colors.primaryHex, 0.2), // translucent fill
        secondaryBorderColor: colors.secondaryHex,
        secondaryBackgroundColor: hexToRgba(colors.secondaryHex, 0.2),
        accentBorderColor: colors.accentHex,
        accentBackgroundColor: hexToRgba(colors.accentHex, 0.2),
        neutralBorderColor: colors.neutralHex,
        neutralBackgroundColor: hexToRgba(colors.neutralHex, 0.2),
        infoBorderColor: colors.infoHex,
        infoBackgroundColor: hexToRgba(colors.infoHex, 0.2),
        successBorderColor: colors.successHex,
        successBackgroundColor: hexToRgba(colors.successHex, 0.2),
        warningBorderColor: colors.warningHex,
        warningBackgroundColor: hexToRgba(colors.warningHex, 0.2),
        errorBorderColor: colors.errorHex,
        errorBackgroundColor: hexToRgba(colors.errorHex, 0.2),
        base100BorderColor: colors.base100Hex,
        base100BackgroundColor: hexToRgba(colors.base100Hex, 0.2),
        base200BorderColor: colors.base200Hex,
        base200BackgroundColor: hexToRgba(colors.base200Hex, 0.2),
        base300BorderColor: colors.base300Hex,
        base300BackgroundColor: hexToRgba(colors.base300Hex, 0.2),
        baseContentBorderColor: colors.baseContentHex,
        baseContentBackgroundColor: hexToRgba(colors.baseContentHex, 0.1),
    };
})();

export function applyThemeToChart(chart: any) {
    const primaryHex = getCssVar("--color-primary");
    const secondaryHex = getCssVar("--color-secondary");
    const accentHex = getCssVar("--color-accent");
    const neutralHex = getCssVar("--color-neutral");
    const infoHex = getCssVar("--color-info");
    const successHex = getCssVar("--color-success");
    const warningHex = getCssVar("--color-warning");
    const errorHex = getCssVar("--color-error");
    const base100Hex = getCssVar("--color-base-100");
    const base200Hex = getCssVar("--color-base-200");
    const base300Hex = getCssVar("--color-base-300");
    const baseContentHex = getCssVar("--color-base-content");

    chart.data.datasets.forEach((ds: any) => {
        ds.primaryBorderColor = primaryHex;
        ds.primaryBackgroundColor = hexToRgba(primaryHex, 0.2);
        ds.secondaryBorderColor = secondaryHex;
        ds.secondaryBackgroundColor = hexToRgba(secondaryHex, 0.2);
        ds.accentBorderColor = accentHex;
        ds.accentBackgroundColor = hexToRgba(accentHex, 0.2);
        ds.neutralBorderColor = neutralHex;
        ds.neutralBackgroundColor = hexToRgba(neutralHex, 0.2);
        ds.infoBorderColor = infoHex;
        ds.infoBackgroundColor = hexToRgba(infoHex, 0.2);
        ds.successBorderColor = successHex;
        ds.successBackgroundColor = hexToRgba(successHex, 0.2);
        ds.warningBorderColor = warningHex;
        ds.warningBackgroundColor = hexToRgba(warningHex, 0.2);
        ds.errorBorderColor = errorHex;
        ds.errorBackgroundColor = hexToRgba(errorHex, 0.2);
        ds.base100BorderColor = base100Hex;
        ds.base100BackgroundColor = hexToRgba(base100Hex, 0.2);
        ds.base200BorderColor = base200Hex;
        ds.base200BackgroundColor = hexToRgba(base200Hex, 0.2);
        ds.base300BorderColor = base300Hex;
        ds.base300BackgroundColor = hexToRgba(base300Hex, 0.2);
        ds.baseContentBorderColor = baseContentHex;
        ds.baseContentBackgroundColor = hexToRgba(baseContentHex, 0.1);
    });
    // Also update options that don't live on datasets (ticks, grid, legend, tooltip)
    const opts: any = chart.options || {};
    if (opts.scales) {
        if (opts.scales.x) {
            opts.scales.x.ticks = { ...(opts.scales.x.ticks || {}), color: baseContentHex };
            if (opts.scales.x.grid) {
                opts.scales.x.grid.color = hexToRgba(base300Hex, 0.4);
            }
        }
        if (opts.scales.y) {
            opts.scales.y.ticks = { ...(opts.scales.y.ticks || {}), color: baseContentHex };
            if (opts.scales.y.grid) {
                opts.scales.y.grid.color = hexToRgba(base300Hex, 0.4);
            }
        }
    }
    if (opts.plugins) {
        if (opts.plugins.legend && opts.plugins.legend.labels) {
            opts.plugins.legend.labels.color = baseContentHex;
        }
        if (opts.plugins.tooltip) {
            opts.plugins.tooltip.backgroundColor = hexToRgba(base100Hex, 0.95);
            opts.plugins.tooltip.titleColor = baseContentHex;
            opts.plugins.tooltip.bodyColor = baseContentHex;
            opts.plugins.tooltip.borderColor = base300Hex;
        }
    }
    chart.update();
}

// Chart registry for managing multiple charts
const chartRegistry = new Set<any>();

export function registerChart(chart: any) {
    chartRegistry.add(chart);
    return () => { chartRegistry.delete(chart); }; // Return cleanup function with void return
}

export function initThemeListener() {
    if (typeof window === 'undefined') return;

    new MutationObserver(() => {
        chartRegistry.forEach(chart => applyThemeToChart(chart));
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
    });
}
