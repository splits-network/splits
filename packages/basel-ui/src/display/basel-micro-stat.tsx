"use client";

import { type BaselSemanticColor, semanticText } from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselMicroStatProps {
    /** The large numeric value */
    value: string;
    /** Label below the value */
    label: string;
    /** DaisyUI semantic color for the value text (optional) */
    color?: BaselSemanticColor;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel micro stat — compact value + label unit for use inside cards and
 * KPI grids. Displays a large `font-black` value with a tiny uppercase label.
 */
export function BaselMicroStat({
    value,
    label,
    color,
    className,
}: BaselMicroStatProps) {
    return (
        <div className={`bg-base-100 p-2 text-center ${className || ""}`}>
            <div
                className={`text-lg font-black ${color ? semanticText[color] : "text-base-content"}`}
            >
                {value}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-base-content/40">
                {label}
            </div>
        </div>
    );
}
