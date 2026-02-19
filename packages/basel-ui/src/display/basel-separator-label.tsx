"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselSeparatorLabelProps {
    /** The label text */
    label: string;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel separator label — label pill + horizontal rule divider.
 * Used to visually separate sections within a page.
 */
export function BaselSeparatorLabel({
    label,
    className,
}: BaselSeparatorLabelProps) {
    return (
        <div className={`flex items-center gap-3 ${className || ""}`}>
            <span className="px-3 py-1 bg-base-200 text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                {label}
            </span>
            <div className="flex-1 h-px bg-base-300" />
        </div>
    );
}
