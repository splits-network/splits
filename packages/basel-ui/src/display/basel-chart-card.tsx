"use client";

import {
    type BaselSemanticColor,
    semanticBorder,
    semanticBg10,
    semanticText,
} from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselChartCardProps {
    /** Chart title */
    title: string;
    /** Subtitle displayed below the title */
    subtitle?: string;
    /** Optional right-aligned badge content (e.g. trend indicator) */
    badge?: React.ReactNode;
    /** Chart content (chart component, SVG, canvas, etc.) */
    children: React.ReactNode;
    /** Optional top border accent color (e.g. for advanced analytics cards) */
    accentColor?: BaselSemanticColor;
    /** Optional icon for the header (used in advanced analytics pattern) */
    icon?: string;
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel chart card — wrapper for all chart sections with a standard
 * title/subtitle/optional-badge header.
 *
 * Supports two variants:
 * - **Standard**: `bg-base-200 p-8` with inline title
 * - **Advanced**: adds `border-t-4` accent + square icon container
 *
 * CSS hook: `.chart-card`
 */
export function BaselChartCard({
    title,
    subtitle,
    badge,
    children,
    accentColor,
    icon,
    className,
    containerRef,
}: BaselChartCardProps) {
    const hasAccent = !!accentColor;
    const resolvedColor = accentColor || "primary";

    return (
        <div
            ref={containerRef}
            className={`chart-card bg-base-200 p-8 ${hasAccent ? `border-t-4 ${semanticBorder[accentColor!]}` : ""} ${className || ""}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className={icon ? "flex items-start gap-4" : ""}>
                    {icon && (
                        <div
                            className={`w-10 h-10 ${semanticBg10[resolvedColor]} flex items-center justify-center flex-shrink-0`}
                        >
                            <i
                                className={`${icon} ${semanticText[resolvedColor]}`}
                            />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-base-content">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-base-content/50">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {badge && <div className="flex-shrink-0">{badge}</div>}
            </div>

            {/* Chart content */}
            {children}
        </div>
    );
}
