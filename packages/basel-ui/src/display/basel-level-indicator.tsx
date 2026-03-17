"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselLevelIndicatorProps {
    /** Current level number */
    level: number;
    /** Level title (e.g. "Veteran") — shown in tooltip */
    title?: string;
    /** Total XP — shown in tooltip */
    totalXp?: number;
    /** Additional className */
    className?: string;
}

/* ─── Level color thresholds ─────────────────────────────────────────────── */

const LEVEL_COLORS: [number, string][] = [
    [18, "bg-error text-error-content"],
    [15, "bg-warning text-warning-content"],
    [13, "bg-accent text-accent-content"],
    [10, "bg-secondary text-secondary-content"],
    [8, "bg-primary text-primary-content"],
    [5, "bg-info text-info-content"],
    [1, "bg-base-content/15 text-base-content"],
];

function getLevelColor(level: number): string {
    for (const [threshold, cls] of LEVEL_COLORS) {
        if (level >= threshold) return cls;
    }
    return "bg-base-content/15 text-base-content";
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel level indicator — inline metadata-row format.
 *
 * Renders a small colored square with the level number + "Lv N" label.
 * Designed to sit alongside other inline metrics (placements, response rate, XP).
 */
export function BaselLevelIndicator({
    level,
    title,
    totalXp,
    className,
}: BaselLevelIndicatorProps) {
    const colorClass = getLevelColor(level);
    const tooltip = [
        `Level ${level}`,
        title,
        totalXp !== undefined ? `${totalXp.toLocaleString()} XP` : null,
    ]
        .filter(Boolean)
        .join(" — ");

    return (
        <span
            className={`tooltip tooltip-bottom flex items-center gap-1.5 ${className || ""}`}
            data-tip={tooltip}
        >
            <span
                className={`w-4 h-4 flex items-center justify-center text-[9px] font-extrabold ${colorClass}`}
            >
                {level}
            </span>
            <span className="text-sm font-semibold text-base-content/60">
                Lv {level}
            </span>
        </span>
    );
}
