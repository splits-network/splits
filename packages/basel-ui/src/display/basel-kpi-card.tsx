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
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel KPI card — the definitive Basel dashboard stat card.
 *
 * Features `border-t-4` top accent, square icon container, massive `font-black`
 * value, small uppercase label, and optional trend indicator.
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
    className,
    containerRef,
}: BaselKpiCardProps) {
    return (
        <div
            ref={containerRef}
            className={`kpi-card bg-base-100 border-t-4 ${semanticBorder[color]} p-6 ${className || ""}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className={`w-12 h-12 ${semanticBg10[color]} flex items-center justify-center`}
                >
                    <i className={`${icon} text-xl ${semanticText[color]}`} />
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
            <div className="text-3xl md:text-4xl font-black tracking-tight text-base-content">
                {value}
            </div>
            <div className="text-sm uppercase tracking-wider text-base-content/50 mt-1">
                {label}
            </div>
        </div>
    );
}
