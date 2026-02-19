"use client";

import { useState, useEffect } from "react";

export interface BaselChartColors {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    base100: string;
    base200: string;
    base300: string;
    baseContent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
}

/** DaisyUI v5 CSS custom properties */
const COLOR_MAP: Record<keyof BaselChartColors, string> = {
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    accent: "var(--color-accent)",
    neutral: "var(--color-neutral)",
    base100: "var(--color-base-100)",
    base200: "var(--color-base-200)",
    base300: "var(--color-base-300)",
    baseContent: "var(--color-base-content)",
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
};

/**
 * Resolves a CSS color expression (including oklch with CSS vars) to hex.
 * oklch() doesn't work in SVG fill/stroke attributes — Recharts needs hex.
 */
function resolveCssColorToHex(cssValue: string): string {
    const el = document.createElement("div");
    el.style.color = cssValue;
    document.body.appendChild(el);
    const resolved = getComputedStyle(el).color;
    document.body.removeChild(el);
    return rgbToHex(resolved);
}

function rgbToHex(rgb: string): string {
    const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return "transparent";
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function resolveAllColors(): BaselChartColors {
    const result = {} as BaselChartColors;
    for (const [key, cssExpr] of Object.entries(COLOR_MAP)) {
        result[key as keyof BaselChartColors] = resolveCssColorToHex(cssExpr);
    }
    return result;
}

// Transparent placeholders for SSR — charts are client-only anyway
const TRANSPARENT = Object.keys(COLOR_MAP).reduce((acc, k) => {
    acc[k as keyof BaselChartColors] = "transparent";
    return acc;
}, {} as BaselChartColors);

/**
 * Appends an alpha channel to a 6-digit hex color → 8-digit hex.
 * e.g. hexWithAlpha("#233876", 0.4) → "#23387666"
 */
export function hexWithAlpha(hex: string, alpha: number): string {
    if (!hex || hex === "transparent") return "transparent";
    const a = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0");
    return `${hex.slice(0, 7)}${a}`;
}

/**
 * Returns DaisyUI theme colors as hex strings for use in Recharts SVG charts.
 * Colors are resolved from CSS custom properties at runtime and update on theme change.
 */
export function useBaselChartColors(): BaselChartColors {
    const [colors, setColors] = useState(TRANSPARENT);

    useEffect(() => {
        setColors(resolveAllColors());

        const observer = new MutationObserver(() => {
            setColors(resolveAllColors());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });
        return () => observer.disconnect();
    }, []);

    return colors;
}
