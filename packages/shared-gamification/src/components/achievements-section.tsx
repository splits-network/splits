"use client";

import { useState, useEffect } from "react";
import type {
    BadgeAward,
    BadgeProgressItem,
    EntityLevelInfo,
    EntityStreakInfo,
} from "../types";
import { BadgeGrid } from "./badge-grid";
import { BadgeProgressCard } from "./badge-progress-card";
import { XpLevelBar } from "./xp-level-bar";
import { StreakIndicator } from "./streak-indicator";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FetchClient {
    get<T = any>(
        endpoint: string,
        options?: { params?: Record<string, any> },
    ): Promise<T>;
}

interface XpHistoryEntry {
    id: string;
    source: string;
    points: number;
    description: string | null;
    created_at: string;
}

interface AchievementsSectionProps {
    entityId: string;
    entityType: "recruiter" | "candidate" | "company";
    getToken: () => Promise<string | null>;
    createClient: (token: string) => FetchClient;
}

const SOURCE_LABELS: Record<string, string> = {
    placement_completed: "Placement Completed",
    application_submitted: "Application Submitted",
    candidate_hired: "Candidate Hired",
    response_sent: "Response Sent",
    profile_completed: "Profile Completed",
    split_completed: "Split Completed",
    review_received: "Review Received",
    streak_bonus: "Streak Bonus",
    referral_bonus: "Referral Bonus",
    first_placement: "First Placement",
    milestone_bonus: "Milestone Bonus",
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export function AchievementsSection({
    entityId,
    entityType,
    getToken,
    createClient,
}: AchievementsSectionProps) {
    const [badges, setBadges] = useState<BadgeAward[]>([]);
    const [progress, setProgress] = useState<BadgeProgressItem[]>([]);
    const [level, setLevel] = useState<EntityLevelInfo | null>(null);
    const [streaks, setStreaks] = useState<EntityStreakInfo[]>([]);
    const [xpHistory, setXpHistory] = useState<XpHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchAll() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createClient(token);
                const params = {
                    entity_type: entityType,
                    entity_id: entityId,
                };

                const [badgeRes, progressRes, levelRes, streakRes, xpRes] =
                    await Promise.allSettled([
                        client.get<{ data: BadgeAward[] }>("/badges/awards", {
                            params,
                        }),
                        client.get<{ data: BadgeProgressItem[] }>(
                            "/badges/progress",
                            { params },
                        ),
                        client.get<{ data: EntityLevelInfo }>("/xp/level", {
                            params,
                        }),
                        client.get<{ data: EntityStreakInfo[] }>("/streaks", {
                            params,
                        }),
                        client.get<{ data: XpHistoryEntry[] }>("/xp/history", {
                            params: { ...params, limit: 20 },
                        }),
                    ]);

                if (cancelled) return;

                if (
                    badgeRes.status === "fulfilled" &&
                    badgeRes.value?.data
                ) {
                    setBadges(badgeRes.value.data);
                }
                if (
                    progressRes.status === "fulfilled" &&
                    progressRes.value?.data
                ) {
                    setProgress(progressRes.value.data);
                }
                if (
                    levelRes.status === "fulfilled" &&
                    levelRes.value?.data
                ) {
                    setLevel(levelRes.value.data);
                }
                if (
                    streakRes.status === "fulfilled" &&
                    streakRes.value?.data
                ) {
                    setStreaks(streakRes.value.data);
                }
                if (
                    xpRes.status === "fulfilled" &&
                    xpRes.value?.data
                ) {
                    setXpHistory(xpRes.value.data);
                }
            } catch {
                // Non-critical — graceful degradation
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchAll();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityId, entityType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Section header */}
            <div className="border-l-4 border-primary pl-4">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
                    Progress
                </p>
                <h2 className="text-2xl font-black tracking-tight">
                    Achievements
                </h2>
                <p className="text-sm text-base-content/50 mt-1">
                    Track your progress, earn badges, and level up on the
                    network.
                </p>
            </div>

            {/* Level + Streaks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-l-4 border-secondary bg-base-200 border-y border-r border-base-300 p-6">
                    <p className="text-sm font-bold uppercase tracking-widest text-secondary mb-3">
                        Level
                    </p>
                    {level ? (
                        <XpLevelBar level={level} />
                    ) : (
                        <p className="text-sm text-base-content/40">
                            No level data yet
                        </p>
                    )}
                </div>

                <div className="border-l-4 border-warning bg-base-200 border-y border-r border-base-300 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <i className="fa-duotone fa-regular fa-fire text-warning" />
                        <p className="text-sm font-bold uppercase tracking-widest text-warning">
                            Active Streaks
                        </p>
                    </div>
                    {streaks.length > 0 ? (
                        <StreakIndicator streaks={streaks} />
                    ) : (
                        <p className="text-sm text-base-content/40">
                            No active streaks. Stay consistent to build streaks.
                        </p>
                    )}
                </div>
            </div>

            {/* Earned Badges */}
            <div className="border-l-4 border-primary bg-base-200 border-y border-r border-base-300">
                <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-trophy text-primary" />
                        <span className="text-sm font-black uppercase tracking-wider text-base-content/60">
                            Earned Badges
                        </span>
                    </div>
                    {badges.length > 0 && (
                        <span className="text-sm font-bold text-base-content/40">
                            {badges.length} earned
                        </span>
                    )}
                </div>
                <BadgeGrid badges={badges} />
            </div>

            {/* In-Progress Badges */}
            {progress.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-chart-line text-secondary" />
                        <span className="text-sm font-black uppercase tracking-wider text-base-content/60">
                            In Progress
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {progress.map((p) => (
                            <BadgeProgressCard key={p.id} progress={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* XP History */}
            {xpHistory.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-accent" />
                        <span className="text-sm font-black uppercase tracking-wider text-base-content/60">
                            Recent XP
                        </span>
                    </div>
                    <div className="border-l-4 border-accent bg-base-200 border-y border-r border-base-300 divide-y divide-base-300">
                        {xpHistory.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between px-5 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-primary">
                                        +{entry.points}
                                    </span>
                                    <span className="text-sm font-semibold text-base-content/70">
                                        {entry.description ||
                                            SOURCE_LABELS[entry.source] ||
                                            entry.source}
                                    </span>
                                </div>
                                <span className="text-sm text-base-content/40">
                                    {new Date(
                                        entry.created_at,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
