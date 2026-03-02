"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LeaderboardRow } from "@splits-network/shared-gamification";
import type { LeaderboardEntryInfo } from "@splits-network/shared-gamification";
import { LoadingState } from "@splits-network/shared-ui";

type EntityType = "recruiter" | "candidate" | "company";
type Period = "weekly" | "monthly" | "quarterly" | "all_time";
type Metric = "total_xp" | "placements" | "hire_rate";

const ENTITY_TABS: { key: EntityType; label: string; icon: string }[] = [
    { key: "recruiter", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
    { key: "candidate", label: "Candidates", icon: "fa-duotone fa-regular fa-user" },
    { key: "company", label: "Companies", icon: "fa-duotone fa-regular fa-building" },
];

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
    { key: "weekly", label: "This Week" },
    { key: "monthly", label: "This Month" },
    { key: "quarterly", label: "This Quarter" },
    { key: "all_time", label: "All Time" },
];

const METRIC_OPTIONS: { key: Metric; label: string }[] = [
    { key: "total_xp", label: "Total XP" },
    { key: "placements", label: "Placements" },
    { key: "hire_rate", label: "Hire Rate" },
];

export default function LeaderboardClient() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();

    const [entityType, setEntityType] = useState<EntityType>("recruiter");
    const [period, setPeriod] = useState<Period>("monthly");
    const [metric, setMetric] = useState<Metric>("total_xp");
    const [entries, setEntries] = useState<LeaderboardEntryInfo[]>([]);
    const [myRank, setMyRank] = useState<LeaderboardEntryInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const myEntityId =
        entityType === "recruiter"
            ? profile?.recruiter_id
            : entityType === "candidate"
              ? profile?.candidate_id
              : null;

    useEffect(() => {
        let cancelled = false;

        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const params = { entity_type: entityType, period, metric, limit: 50 };
                const [leaderboardRes, rankRes] = await Promise.allSettled([
                    client.get<{ data: LeaderboardEntryInfo[] }>("/leaderboards", { params }),
                    myEntityId
                        ? client.get<{ data: LeaderboardEntryInfo }>("/leaderboards/rank", {
                              params: { entity_type: entityType, entity_id: myEntityId, period, metric },
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

        fetchLeaderboard();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityType, period, metric, myEntityId]);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-1">Leaderboard</h1>
                <p className="text-sm font-semibold text-base-content/50">
                    See how you stack up against the network.
                </p>
            </div>

            {/* Entity type tabs */}
            <div className="flex gap-1 bg-base-200 border border-base-300 p-1 w-fit">
                {ENTITY_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 text-sm font-bold transition-colors ${
                            entityType === tab.key
                                ? "bg-primary text-primary-content"
                                : "text-base-content/50 hover:text-base-content"
                        }`}
                        onClick={() => setEntityType(tab.key)}
                    >
                        <i className={`${tab.icon} mr-2`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-4">
                <fieldset className="fieldset">
                    <label className="label text-xs font-bold uppercase tracking-wider text-base-content/40">
                        Period
                    </label>
                    <select
                        className="select select-sm"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                    >
                        {PERIOD_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </fieldset>

                <fieldset className="fieldset">
                    <label className="label text-xs font-bold uppercase tracking-wider text-base-content/40">
                        Metric
                    </label>
                    <select
                        className="select select-sm"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value as Metric)}
                    >
                        {METRIC_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </fieldset>
            </div>

            {/* My rank highlight */}
            {myRank && (
                <div className="bg-primary/5 border border-primary/20 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-primary">#{myRank.rank}</span>
                        <div>
                            <p className="text-sm font-bold">Your Rank</p>
                            <p className="text-sm text-base-content/50">
                                Score: {myRank.score.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <i className="fa-duotone fa-regular fa-medal text-primary text-2xl" />
                </div>
            )}

            {/* Leaderboard list */}
            {loading ? (
                <LoadingState message="Loading leaderboard..." />
            ) : entries.length === 0 ? (
                <div className="bg-base-200 border border-base-300 p-12 text-center">
                    <i className="fa-duotone fa-regular fa-ranking-star text-4xl text-base-content/20 mb-4" />
                    <p className="text-sm font-semibold text-base-content/50">
                        No leaderboard data for this period yet.
                    </p>
                </div>
            ) : (
                <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                    {entries.map((entry) => (
                        <LeaderboardRow
                            key={entry.id}
                            entry={entry}
                            isCurrentUser={entry.entity_id === myEntityId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
