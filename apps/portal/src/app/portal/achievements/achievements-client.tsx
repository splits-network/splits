"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BadgeGrid,
    BadgeProgressCard,
    XpLevelBar,
    StreakIndicator,
} from "@splits-network/shared-gamification";
import type {
    BadgeAward,
    BadgeProgressItem,
    EntityLevelInfo,
    EntityStreakInfo,
} from "@splits-network/shared-gamification";
import { LoadingState } from "@splits-network/shared-ui";

interface XpHistoryEntry {
    id: string;
    source: string;
    points: number;
    description: string | null;
    created_at: string;
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

export default function AchievementsClient() {
    const { getToken } = useAuth();
    const { profile, isLoading: profileLoading } = useUserProfile();

    const [badges, setBadges] = useState<BadgeAward[]>([]);
    const [progress, setProgress] = useState<BadgeProgressItem[]>([]);
    const [level, setLevel] = useState<EntityLevelInfo | null>(null);
    const [streaks, setStreaks] = useState<EntityStreakInfo[]>([]);
    const [xpHistory, setXpHistory] = useState<XpHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const entityId = profile?.recruiter_id || profile?.candidate_id;
    const entityType = profile?.recruiter_id ? "recruiter" : profile?.candidate_id ? "candidate" : null;

    useEffect(() => {
        if (!entityId || !entityType) return;
        let cancelled = false;

        async function fetchAll() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const params = { entity_type: entityType, entity_id: entityId };

                const [badgeRes, progressRes, levelRes, streakRes, xpRes] =
                    await Promise.allSettled([
                        client.get<{ data: BadgeAward[] }>("/badges/awards", { params }),
                        client.get<{ data: BadgeProgressItem[] }>("/badges/progress", { params }),
                        client.get<{ data: EntityLevelInfo }>("/xp/level", { params }),
                        client.get<{ data: EntityStreakInfo[] }>("/streaks", { params }),
                        client.get<{ data: XpHistoryEntry[] }>("/xp/history", { params: { ...params, limit: 20 } }),
                    ]);

                if (cancelled) return;

                if (badgeRes.status === "fulfilled" && badgeRes.value?.data) {
                    setBadges(badgeRes.value.data);
                }
                if (progressRes.status === "fulfilled" && progressRes.value?.data) {
                    setProgress(progressRes.value.data);
                }
                if (levelRes.status === "fulfilled" && levelRes.value?.data) {
                    setLevel(levelRes.value.data);
                }
                if (streakRes.status === "fulfilled" && streakRes.value?.data) {
                    setStreaks(streakRes.value.data);
                }
                if (xpRes.status === "fulfilled" && xpRes.value?.data) {
                    setXpHistory(xpRes.value.data);
                }
            } catch {
                // Non-critical
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchAll();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityId, entityType]);

    if (profileLoading || loading) {
        return (
            <div className="p-8">
                <LoadingState message="Loading achievements..." />
            </div>
        );
    }

    if (!entityId || !entityType) {
        return (
            <div className="p-8 text-center">
                <i className="fa-duotone fa-regular fa-trophy text-4xl text-base-content/20 mb-4" />
                <p className="text-base font-semibold text-base-content/50">
                    Complete your profile to start earning achievements.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-1">Achievements</h1>
                <p className="text-sm font-semibold text-base-content/50">
                    Track your progress, earn badges, and level up on the network.
                </p>
            </div>

            {/* Level + Streaks row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Level card */}
                <div className="bg-base-200 border border-base-300 p-6">
                    {level ? (
                        <XpLevelBar level={level} />
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-base-content/40">No level data yet</p>
                        </div>
                    )}
                </div>

                {/* Streaks card */}
                <div className="bg-base-200 border border-base-300 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fa-duotone fa-regular fa-fire text-warning" />
                        <span className="text-sm font-black uppercase tracking-wider text-base-content/60">
                            Active Streaks
                        </span>
                    </div>
                    {streaks.length > 0 ? (
                        <StreakIndicator streaks={streaks} />
                    ) : (
                        <p className="text-sm text-base-content/40">
                            No active streaks. Stay consistent to build streaks!
                        </p>
                    )}
                </div>
            </div>

            {/* Earned Badges */}
            <div className="bg-base-200 border border-base-300">
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
                    <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                        {xpHistory.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-primary">
                                        +{entry.points}
                                    </span>
                                    <span className="text-sm font-semibold text-base-content/70">
                                        {entry.description || SOURCE_LABELS[entry.source] || entry.source}
                                    </span>
                                </div>
                                <span className="text-sm text-base-content/40">
                                    {new Date(entry.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
