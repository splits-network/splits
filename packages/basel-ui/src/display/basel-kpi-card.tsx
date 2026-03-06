"use client";

import {
    type BaselSemanticColor,
    semanticBorder,
    semanticBg10,
    semanticText,
} from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselKpiCardProps {
    /** KPI label (e.g. "Active Jobs") */
    label: string;
    /** KPI value (e.g. "1,234" or "$234,500") */
    value: string;
    /** FontAwesome icon class */
    icon: string;
    /** DaisyUI semantic color (default: "primary") */
    color?: BaselSemanticColor;
    /** Trend text (e.g. "+12%", "+4") */
    trend?: string;
    /** Whether the trend is positive */
    trendUp?: boolean;
    /** Card size: "default" for hero KPIs, "compact" for secondary metrics */
    size?: "default" | "compact";
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel KPI card — the definitive Basel dashboard stat card.
 *
 * **default**: `border-t-4` top accent, square icon, massive `font-black` value.
 * **compact**: `border-l-4` left accent, horizontal layout, smaller footprint.
 *
 * CSS hook: `.kpi-card`
 */
export function BaselKpiCard({
    label,
    value,
    icon,
    color = "primary",
    trend,
    trendUp,
    size = "default",
    className,
    containerRef,
}: BaselKpiCardProps) {
    if (size === "compact") {
        return (
            <div
                ref={containerRef}
                className={`kpi-card bg-base-100 border-l-4 ${semanticBorder[color]} px-3 py-2 ${className || ""}`}
            >
                <div className="flex items-center gap-3 mb-0.5">
                    <div
                        className={`w-8 h-8 ${semanticBg10[color]} flex items-center justify-center shrink-0`}
                    >
                        <i className={`${icon} text-sm ${semanticText[color]}`} />
                    </div>
                    <div className="flex-1 flex items-baseline justify-end gap-2">
                        <div className="text-xl font-black tracking-tight text-base-content leading-none">
                            {value}
                        </div>
                        {trend && (
                            <div
                                className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? "text-success" : "text-error"}`}
                            >
                                <i
                                    className={`fa-solid ${trendUp ? "fa-arrow-up" : "fa-arrow-down"} text-xs`}
                                />
                                {trend}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm uppercase tracking-wider text-base-content/50">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`kpi-card bg-base-100 border-t-4 ${semanticBorder[color]} p-5 ${className || ""}`}
        >
            <div className="flex items-center gap-4 mb-1">
                <div
                    className={`w-12 h-12 ${semanticBg10[color]} flex items-center justify-center shrink-0`}
                >
                    <i className={`${icon} text-xl ${semanticText[color]}`} />
                </div>
                <div className="flex-1 flex items-baseline justify-end gap-2">
                    <div className="text-2xl md:text-3xl font-black tracking-tight text-base-content leading-none">
                        {value}
                    </div>
                    {trend && (
                        <div
                            className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? "text-success" : "text-error"}`}
                        >
                            <i
                                className={`fa-solid ${trendUp ? "fa-arrow-up" : "fa-arrow-down"} text-xs`}
                            />
                            {trend}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-sm uppercase tracking-wider text-base-content/50">
                {label}
            </div>
        </div>
    );
}
