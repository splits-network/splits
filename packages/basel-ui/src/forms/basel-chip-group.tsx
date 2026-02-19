"use client";

import { useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselChipGroupProps {
    /** All available options */
    options: string[];
    /** Currently selected options */
    selected: string[];
    /** Called when the selection changes */
    onChange: (selected: string[]) => void;
    /** DaisyUI semantic color for selected chips (default: "primary") */
    color?: "primary" | "secondary" | "accent" | "info" | "success" | "warning";
    /** Additional className on the container */
    className?: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const COLOR_SELECTED_MAP: Record<string, string> = {
    primary: "bg-primary text-primary-content",
    secondary: "bg-secondary text-secondary-content",
    accent: "bg-accent text-accent-content",
    info: "bg-info text-info-content",
    success: "bg-success text-success-content",
    warning: "bg-warning text-warning-content",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel chip group — toggleable chip/tag selector for multi-select values
 * (e.g. skills, benefits). Selected chips show with a remove X, unselected
 * chips show with a + icon.
 */
export function BaselChipGroup({
    options,
    selected,
    onChange,
    color = "primary",
    className,
}: BaselChipGroupProps) {
    const toggle = useCallback(
        (option: string) => {
            if (selected.includes(option)) {
                onChange(selected.filter((s) => s !== option));
            } else {
                onChange([...selected, option]);
            }
        },
        [selected, onChange],
    );

    const selectedSet = new Set(selected);
    const selectedBg = COLOR_SELECTED_MAP[color] || COLOR_SELECTED_MAP.primary;

    return (
        <div className={className}>
            {/* Selected chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selected.map((chip) => (
                        <span
                            key={chip}
                            className={`flex items-center gap-1.5 px-3 py-1 ${selectedBg} text-xs font-semibold`}
                        >
                            {chip}
                            <button
                                type="button"
                                onClick={() => toggle(chip)}
                                className="hover:opacity-70"
                            >
                                <i className="fa-solid fa-xmark text-[9px]" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {/* Unselected options */}
            <div className="flex flex-wrap gap-2">
                {options
                    .filter((o) => !selectedSet.has(o))
                    .map((chip) => (
                        <button
                            key={chip}
                            type="button"
                            onClick={() => toggle(chip)}
                            className="px-3 py-1 text-xs font-semibold bg-base-200 text-base-content/50 border border-base-300 hover:border-primary/50 hover:text-primary transition-colors"
                        >
                            <i className="fa-solid fa-plus text-[8px] mr-1" />
                            {chip}
                        </button>
                    ))}
            </div>
        </div>
    );
}
