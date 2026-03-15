"use client";

import { useState, useEffect } from "react";
import type { LeaderboardEntryInfo } from "../types";
import { LeaderboardRow } from "./leaderboard-row";

interface FetchClient {
    get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T>;
}

type EntityType = "recruiter" | "candidate" | "company";
type Period = "weekly" | "monthly" | "quarterly" | "all_time";
type Metric = "total_xp" | "placements" | "hire_rate";

interface MiniLeaderboardProps {
    entityType: EntityType;
    entityId?: string;
    client: FetchClient | null;
    period?: Period;
    metric?: Metric;
    limit?: number;
    title?: string;
    specialization?: string;
    showToggle?: boolean;
    fullLeaderboardHref?: string;
}

const ENTITY_LABELS: Record<EntityType, string> = {
    recruiter: "Recruiters",
    candidate: "Candidates",
    company: "Companies",
};

export function MiniLeaderboard({
    entityType,
    entityId,
    client,
    period = "monthly",
    metric = "total_xp",
    limit = 5,
    title,
    specialization,
    showToggle = false,
    fullLeaderboardHref,
}: MiniLeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntryInfo[]>([]);
    const [myRank, setMyRank] = useState<LeaderboardEntryInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<"overall" | "specialization">("overall");
    const effectiveSpecialization = filterMode === "specialization" ? specialization : undefined;

    useEffect(() => {
        if (!client) return;

        let cancelled = false;
        setLoading(true);

        async function fetchData() {
            try {
                const params: Record<string, any> = {
                    entity_type: entityType,
                    period,
                    metric,
                    limit,
                };
                if (effectiveSpecialization) {
                    params.specialization = effectiveSpecialization;
                }

                const [leaderboardRes, rankRes] = await Promise.allSettled([
                    client!.get<{ data: LeaderboardEntryInfo[] }>("/leaderboards", { params }),
                    entityId
                        ? client!.get<{ data: LeaderboardEntryInfo }>("/leaderboards/rank", {
                              params: { entity_type: entityType, entity_id: entityId, period, metric },
                          })
                        : Promise.reject("no entity"),
                ]);

                if (cancelled) return;

                if (leaderboardRes.status === "fulfilled" && leaderboardRes.value?.data) {
                    setEntries(leaderboardRes.value.data);
                } else {
                    setEntries([]);
                }

                if (rankRes.status === "fulfilled" && rankRes.value?.data) {
                    setMyRank(rankRes.value.data);
                } else {
                    setMyRank(null);
                }
            } catch {
                setEntries([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [client, entityType, period, metric, limit, entityId, filterMode, effectiveSpecialization]);

    const heading = title || `Top ${ENTITY_LABELS[entityType]}`;
    const myRankInList = myRank && entries.some((e) => e.entity_id === entityId);

    return (
        <div className="border-l-4 border-primary bg-base-200 shadow-sm">
            <div className="px-4 py-3 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Rankings</p>
                <h3 className="text-sm font-black tracking-tight">{heading}</h3>

                {showToggle && specialization && (
                    <div className="flex gap-1 mt-2">
                        <button
                            className={`btn btn-xs ${filterMode === "overall" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setFilterMode("overall")}
                        >
                            Overall
                        </button>
                        <button
                            className={`btn btn-xs ${filterMode === "specialization" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setFilterMode("specialization")}
                        >
                            My Specialization
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="px-4 py-6 text-center">
                    <span className="loading loading-spinner loading-sm text-primary" />
                </div>
            ) : entries.length === 0 ? (
                <div className="px-4 py-6 text-center">
                    <i className="fa-duotone fa-regular fa-ranking-star text-2xl text-base-content/20 mb-2" />
                    <p className="text-sm text-base-content/50">Rankings building soon. Start earning to lead.</p>
                </div>
            ) : (
                <div className="divide-y divide-base-300">
                    {entries.map((entry) => (
                        <LeaderboardRow
                            key={entry.id}
                            entry={entry}
                            isCurrentUser={entry.entity_id === entityId}
                        />
                    ))}
                </div>
            )}

            {myRank && !myRankInList && (
                <div className="border-t border-base-300 px-4 py-2 bg-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-primary">#{myRank.rank}</span>
                            <span className="text-sm font-bold">Your Rank</span>
                        </div>
                        <span className="text-sm font-black text-base-content/60">
                            {myRank.score.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {fullLeaderboardHref && (
                <a
                    href={fullLeaderboardHref}
                    className="block px-4 py-2 border-t border-base-300 text-xs font-bold text-primary hover:bg-primary/5 transition-colors text-center"
                >
                    View Full Rankings <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </a>
            )}
        </div>
    );
}
