"use client";

import {
    getTierColor,
    semanticText,
    semanticBg,
    semanticPill,
} from "@splits-network/basel-ui";
import { EntityLevelInfo } from "../types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface LevelBadgeProps {
    level: EntityLevelInfo;
    /** sm = avatar overlay, md = card accent, lg = hero profile stat */
    size?: "sm" | "md" | "lg";
}

/* ─── Progress ───────────────────────────────────────────────────────────── */

function calcProgress(level: EntityLevelInfo): number {
    if (level.xp_to_next_level <= 0) return 100;
    return Math.min(
        100,
        100 - (level.xp_to_next_level / (level.total_xp + level.xp_to_next_level)) * 100,
    );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function LevelBadge({ level, size = "sm" }: LevelBadgeProps) {
    const tier = getTierColor(level.current_level);
    const textClass = semanticText[tier];
    const fillClass = semanticBg[tier];
    const pillClass = semanticPill[tier];
    const pct = calcProgress(level);
    const isMax = level.xp_to_next_level <= 0;

    const tip = `Level ${level.current_level} — ${level.title} (${level.total_xp.toLocaleString()} XP)`;

    /* sm — compact badge for avatar overlays */
    if (size === "sm") {
        return (
            <span className={`${pillClass} flex items-center justify-center w-6 h-6 text-[11px] font-black`} title={tip}>
                {level.current_level}
            </span>
        );
    }

    /* md — card accent with short progress bar */
    if (size === "md") {
        return (
            <div className="flex items-baseline gap-2" title={tip}>
                <span className={`text-xl font-black leading-none ${textClass}`}>
                    {level.current_level}
                </span>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-base-content/40 leading-none">
                        {level.title}
                    </span>
                    <span className="w-16 h-1 bg-base-300 overflow-hidden">
                        <span
                            className={`block h-full ${fillClass} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                        />
                    </span>
                </div>
            </div>
        );
    }

    /* lg — hero profile stat (magazine layout) */
    return (
        <div className="flex flex-col gap-1.5" title={tip}>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 leading-none">
                Level
            </span>
            <div className="flex items-baseline gap-2.5">
                <span className={`text-3xl font-black leading-none ${textClass}`}>
                    {level.current_level}
                </span>
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-base-content leading-none">
                        {level.title}
                    </span>
                    <span className="text-xs text-base-content/40">
                        {isMax
                            ? `${level.total_xp.toLocaleString()} XP — MAX`
                            : `${level.xp_to_next_level.toLocaleString()} XP to next level`}
                    </span>
                </div>
            </div>
            <span className="w-36 h-1.5 bg-base-300 overflow-hidden">
                <span
                    className={`block h-full ${fillClass} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </span>
        </div>
    );
}
