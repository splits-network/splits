"use client";

import { LeaderboardEntryInfo } from "../types";

interface LeaderboardNextMilestoneProps {
    myRank: LeaderboardEntryInfo | null;
    entries: LeaderboardEntryInfo[];
}

export function LeaderboardNextMilestone({ myRank, entries }: LeaderboardNextMilestoneProps) {
    if (!myRank) {
        return (
            <div className="rounded-none bg-base-200 border-l-4 border-warning shadow-sm lb-sidebar-card p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-warning">
                    NEXT MILESTONE
                </p>
                <p className="text-sm text-base-content/50 mt-3">
                    Start earning XP to appear on the board.
                </p>
            </div>
        );
    }

    if (myRank.rank === 1) {
        return (
            <div className="rounded-none bg-base-200 border-l-4 border-warning shadow-sm lb-sidebar-card p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-warning">
                    NEXT MILESTONE
                </p>
                <p className="text-3xl font-black text-primary mt-3">
                    You&apos;re #1
                </p>
                <p className="text-sm text-base-content/50 mt-2">
                    Hold your position. Others are climbing.
                </p>
            </div>
        );
    }

    const targetEntry = entries.find((e) => e.rank === myRank.rank - 1);

    if (!targetEntry) {
        return (
            <div className="rounded-none bg-base-200 border-l-4 border-warning shadow-sm lb-sidebar-card p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-warning">
                    NEXT MILESTONE
                </p>
                <p className="text-sm text-base-content/50 mt-3">
                    Keep climbing to unlock your next milestone.
                </p>
            </div>
        );
    }

    const delta = targetEntry.score - myRank.score;
    const progressPercent = targetEntry.score > 0
        ? Math.min(100, (myRank.score / targetEntry.score) * 100)
        : 0;
    const targetName = targetEntry.display_name || "Anonymous";

    return (
        <div className="rounded-none bg-base-200 border-l-4 border-warning shadow-sm lb-sidebar-card p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-warning">
                NEXT MILESTONE
            </p>

            <p className="text-3xl font-black text-base-content mt-3">
                {delta.toLocaleString()}
            </p>

            <p className="text-sm font-bold text-base-content/50 mt-1">
                points to pass {targetName} at #{targetEntry.rank}
            </p>

            <div className="rounded-none h-2 bg-base-300 mt-4 overflow-hidden">
                <div
                    className="rounded-none h-full bg-warning transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
