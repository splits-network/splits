"use client";

import { useState, useEffect } from "react";

export interface BaselChartColors {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    base100: string;
    base200: string;
    baseContent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
}

function getBaselChartColors(): BaselChartColors {
    if (typeof document === "undefined") {
        return {
            primary: "#570df8",
            secondary: "#f000b8",
            accent: "#37cdbe",
            neutral: "#3d4451",
            base100: "#ffffff",
            base200: "#f2f2f2",
            baseContent: "#1f2937",
            success: "#36d399",
            error: "#f87272",
            warning: "#fbbd23",
            info: "#3abff8",
        };
    }
    const s = getComputedStyle(document.documentElement);
    return {
        primary: `oklch(${s.getPropertyValue("--p").trim()})`,
        secondary: `oklch(${s.getPropertyValue("--s").trim()})`,
        accent: `oklch(${s.getPropertyValue("--a").trim()})`,
        neutral: `oklch(${s.getPropertyValue("--n").trim()})`,
        base100: `oklch(${s.getPropertyValue("--b1").trim()})`,
        base200: `oklch(${s.getPropertyValue("--b2").trim()})`,
        baseContent: `oklch(${s.getPropertyValue("--bc").trim()})`,
        success: `oklch(${s.getPropertyValue("--su").trim()})`,
        error: `oklch(${s.getPropertyValue("--er").trim()})`,
        warning: `oklch(${s.getPropertyValue("--wa").trim()})`,
        info: `oklch(${s.getPropertyValue("--in").trim()})`,
    };
}

/** Series color order for multi-series charts. */
export function getSeriesColors(colors: BaselChartColors): string[] {
    return [colors.primary, colors.secondary, colors.accent, colors.info, colors.success];
}

export function useBaselChartColors(): BaselChartColors {
    const [colors, setColors] = useState<BaselChartColors>(getBaselChartColors);

    useEffect(() => {
        setColors(getBaselChartColors());

        const observer = new MutationObserver(() => {
            setColors(getBaselChartColors());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });
        return () => observer.disconnect();
    }, []);

    return colors;
}
