"use client";

import { EntityLevelInfo } from "../types";

interface LevelBadgeProps {
    level: EntityLevelInfo;
    size?: "sm" | "md";
}

const LEVEL_COLORS: Record<number, string> = {
    1: "badge-ghost",
    5: "badge-info",
    8: "badge-primary",
    10: "badge-secondary",
    13: "badge-accent",
    15: "badge-warning",
    18: "badge-error",
};

function getLevelColor(level: number): string {
    let color = "badge-ghost";
    for (const [threshold, cls] of Object.entries(LEVEL_COLORS)) {
        if (level >= Number(threshold)) color = cls;
    }
    return color;
}

export function LevelBadge({ level, size = "sm" }: LevelBadgeProps) {
    const colorClass = getLevelColor(level.current_level);
    const sizeClass = size === "sm" ? "badge-sm" : "";

    return (
        <span
            className={`badge ${colorClass} ${sizeClass} gap-1 font-bold`}
            title={`Level ${level.current_level} - ${level.title} (${level.total_xp.toLocaleString()} XP)`}
        >
            <i className="fa-solid fa-star text-[10px]" />
            {level.current_level}
        </span>
    );
}
