"use client";

import {
    type BaselSemanticColor,
    semanticBg10,
    semanticText,
} from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselCheckListProps {
    /** List of text items */
    items: string[];
    /** DaisyUI semantic color for the check icon (default: "primary") */
    color?: BaselSemanticColor;
    /** FontAwesome icon class override (default: "fa-duotone fa-regular fa-check") */
    icon?: string;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel check list — list of items with square check icon containers.
 * Used for job responsibilities, feature lists, and empty state suggestions.
 */
export function BaselCheckList({
    items,
    color = "primary",
    icon = "fa-duotone fa-regular fa-check",
    className,
}: BaselCheckListProps) {
    return (
        <div className={`space-y-3 ${className || ""}`}>
            {items.map((item) => (
                <div key={item} className="flex gap-3">
                    <div
                        className={`w-6 h-6 ${semanticBg10[color]} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                        <i className={`${icon} ${semanticText[color]} text-xs`} />
                    </div>
                    <span className="text-base-content/70 text-sm leading-relaxed">
                        {item}
                    </span>
                </div>
            ))}
        </div>
    );
}
