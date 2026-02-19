"use client";

import { type BaselSemanticColor, semanticPill } from "../utils/colors";

/* ─── Re-export for backwards compat ─────────────────────────────────────── */

export type BaselStatusColor = BaselSemanticColor;

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselStatusPillProps {
    /** Text to display */
    children: React.ReactNode;
    /** Semantic color (default: "primary") */
    color?: BaselSemanticColor;
    /** Additional className */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel status pill — square-cornered inline badge with semantic color.
 *
 * `px-2 py-0.5 text-[10px] font-bold uppercase` — the universal Basel
 * status/tag/badge pattern used across tables, cards, lists, and headers.
 */
export function BaselStatusPill({
    children,
    color = "primary",
    className,
}: BaselStatusPillProps) {
    return (
        <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase ${semanticPill[color]} ${className || ""}`}
        >
            {children}
        </span>
    );
}
