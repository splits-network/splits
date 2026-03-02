"use client";

import { EntityStreakInfo } from "../types";

const STREAK_TYPE_LABELS: Record<string, string> = {
    weekly_placement: "Weekly Placements",
    daily_login: "Daily Activity",
    monthly_submission: "Monthly Submissions",
};

interface StreakIndicatorProps {
    streaks: EntityStreakInfo[];
}

export function StreakIndicator({ streaks }: StreakIndicatorProps) {
    const activeStreaks = streaks.filter((s) => s.current_count > 0);

    if (activeStreaks.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {activeStreaks.map((streak) => (
                <div
                    key={streak.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded"
                >
                    <i className="fa-duotone fa-regular fa-fire text-warning text-sm" />
                    <span className="text-xs font-bold text-warning">
                        {streak.current_count}
                    </span>
                    <span className="text-xs font-bold text-base-content/50">
                        {STREAK_TYPE_LABELS[streak.streak_type] || streak.streak_type}
                    </span>
                </div>
            ))}
        </div>
    );
}
