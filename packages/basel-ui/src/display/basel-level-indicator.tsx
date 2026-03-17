"use client";

import { getTierColor, semanticText, semanticBg } from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselLevelIndicatorProps {
    /** Current level number */
    level: number;
    /** Level title (e.g. "Experienced") — shown in tooltip */
    title?: string;
    /** Total XP — shown in tooltip and used for progress calc */
    totalXp?: number;
    /** XP remaining to reach next level — enables the progress bar */
    xpToNextLevel?: number;
    /** Additional className */
    className?: string;
}

/* ─── Progress Calculation ───────────────────────────────────────────────── */

function calcProgress(totalXp: number, xpToNextLevel: number): number {
    if (xpToNextLevel <= 0) return 100;
    return Math.min(
        100,
        100 - (xpToNextLevel / (totalXp + xpToNextLevel)) * 100,
    );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Radiant Power Bar — compact inline level indicator.
 *
 * Bold typographic level number in tier color with an integrated progress bar.
 * Designed for metadata rows in cards, list items, and table rows.
 */
export function BaselLevelIndicator({
    level,
    title,
    totalXp,
    xpToNextLevel,
    className,
}: BaselLevelIndicatorProps) {
    const tier = getTierColor(level);
    const textClass = semanticText[tier];
    const fillClass = semanticBg[tier];

    const hasProgress =
        xpToNextLevel != null && totalXp != null;
    const pct = hasProgress ? calcProgress(totalXp, xpToNextLevel) : 0;

    const tooltip = [
        `Level ${level}`,
        title,
        totalXp !== undefined ? `${totalXp.toLocaleString()} XP` : null,
        hasProgress && xpToNextLevel > 0
            ? `${xpToNextLevel.toLocaleString()} XP to next level`
            : null,
    ]
        .filter(Boolean)
        .join(" — ");

    return (
        <span
            className={`tooltip tooltip-bottom flex items-center gap-1.5 ${className || ""}`}
            data-tip={tooltip}
        >
            {/* Bold level number */}
            <span className={`text-sm font-black leading-none ${textClass}`}>
                {level}
            </span>

            {/* Progress bar or fallback label */}
            {hasProgress ? (
                <span className="flex flex-col justify-center gap-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-base-content/40 leading-none">
                        Lv {level}
                    </span>
                    <span className="w-10 h-1 bg-base-300 mt-0.5 overflow-hidden">
                        <span
                            className={`block h-full ${fillClass} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                        />
                    </span>
                </span>
            ) : (
                <span className="text-sm font-semibold text-base-content/60">
                    Lv {level}
                </span>
            )}
        </span>
    );
}
