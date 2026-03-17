"use client";

import { LeaderboardEntryInfo, EntityLevelInfo } from "../types";
import { LevelBadge } from "./level-badge";
import { XpLevelBar } from "./xp-level-bar";

interface LeaderboardYourStatsProps {
    myRank: LeaderboardEntryInfo | null;
    level?: EntityLevelInfo;
    entityType: string;
    period: string;
    metric: string;
}

const METRIC_LABELS: Record<string, string> = {
    total_xp: "XP",
    placements: "Placements",
    hire_rate: "Hire Rate",
};

const PERIOD_LABELS: Record<string, string> = {
    weekly: "This Week",
    monthly: "This Month",
    quarterly: "Last 90 Days",
    all_time: "All Time",
};

export function LeaderboardYourStats({ myRank, level, period, metric }: LeaderboardYourStatsProps) {
    const metricLabel = METRIC_LABELS[metric] || metric;
    const periodLabel = PERIOD_LABELS[period] || period;

    if (!myRank) {
        return (
            <div className="rounded-none bg-base-200 shadow-sm lb-sidebar-card border-l-4 border-base-300 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">
                    YOU&apos;RE NOT ON THE BOARD
                </p>
                <h3 className="text-lg font-black text-base-content mt-3">
                    Your Rank Awaits.
                </h3>
                <p className="text-sm text-base-content/50 mt-2">
                    Make placements, earn XP, stay active. Your first rank drops faster than you think.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-none bg-base-200 shadow-sm lb-sidebar-card border-l-4 border-primary p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
                YOUR STANDING
            </p>

            <div className="flex items-center gap-3 mt-3">
                <span className="text-5xl font-black text-primary">
                    #{myRank.rank}
                </span>
                {level && <LevelBadge level={level} size="md" />}
            </div>

            <p className="text-sm font-bold text-base-content/60 mt-3">
                {myRank.score.toLocaleString()} {metricLabel}
            </p>

            {level && (
                <div className="mt-3">
                    <XpLevelBar level={level} compact />
                </div>
            )}

            <p className="text-sm text-base-content/40 mt-3">
                {periodLabel}
            </p>
        </div>
    );
}
