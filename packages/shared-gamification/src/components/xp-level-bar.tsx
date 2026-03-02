"use client";

import { EntityLevelInfo } from "../types";

interface XpLevelBarProps {
    level: EntityLevelInfo;
    compact?: boolean;
}

export function XpLevelBar({ level, compact }: XpLevelBarProps) {
    const nextLevelXp = level.total_xp + level.xp_to_next_level;
    const currentLevelXp = nextLevelXp - level.xp_to_next_level;
    const progressInLevel = level.xp_to_next_level > 0
        ? ((level.total_xp - currentLevelXp) / level.xp_to_next_level) * 100
        : 100;

    // For the bar, compute how far we are toward the next level
    const progressPercent = level.xp_to_next_level > 0
        ? Math.min(100, 100 - (level.xp_to_next_level / (level.total_xp + level.xp_to_next_level)) * 100)
        : 100;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-primary">LVL {level.current_level}</span>
                <span className="text-xs font-bold text-base-content/40">{level.title}</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-primary">LVL {level.current_level}</span>
                    <span className="text-sm font-bold text-base-content/60">{level.title}</span>
                </div>
                <span className="text-xs font-bold text-base-content/40">
                    {level.total_xp.toLocaleString()} XP
                </span>
            </div>
            <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
            <p className="text-xs text-base-content/40">
                {level.xp_to_next_level.toLocaleString()} XP to Level {level.current_level + 1}
            </p>
        </div>
    );
}
