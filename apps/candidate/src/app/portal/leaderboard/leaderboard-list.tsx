import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";
import { LeaderboardRow } from "@splits-network/shared-gamification";
import { BaselLevelIndicator } from "@splits-network/basel-ui";
import type { LeaderboardEntryInfo, EntityLevelInfo } from "@splits-network/shared-gamification";
import { LoadingState } from "@splits-network/shared-ui";

interface LeaderboardListProps {
    entries: LeaderboardEntryInfo[];
    myEntityId: string | null;
    loading: boolean;
    levelMap?: Map<string, EntityLevelInfo>;
}

export function LeaderboardList({ entries, myEntityId, loading, levelMap }: LeaderboardListProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const ranked = entries.filter((e) => e.rank > 3);

    useScrollReveal(listRef);

    if (loading) {
        return <LoadingState message="Loading leaderboard..." />;
    }

    if (entries.length === 0) {
        return (
            <div className="bg-base-200 border-l-4 border-base-300 shadow-sm rounded-none p-12 text-center">
                <i className="fa-duotone fa-regular fa-ranking-star text-4xl text-base-content/20 mb-4 block" />
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1">
                    No Data
                </p>
                <p className="text-sm font-semibold text-base-content/50">
                    Build your score. Every placement counts.
                </p>
            </div>
        );
    }

    if (ranked.length === 0) return null;

    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-3">
                Ranks 4+
            </p>

            <div
                ref={listRef}
                className="bg-base-200 border border-base-300 border-l-4 border-l-primary shadow-sm rounded-none divide-y divide-base-300"
            >
                {ranked.map((entry) => (
                    <div key={entry.id} className="collapse bg-base-100 rounded-none scroll-reveal slide-from-left">
                        <input type="checkbox" />
                        <div className="collapse-title p-0">
                            <LeaderboardRow
                                entry={entry}
                                isCurrentUser={entry.entity_id === myEntityId}
                            />
                        </div>
                        <div className="collapse-content border-t border-base-300 bg-base-100 rounded-none">
                            <div className="pt-4 pb-2 px-4 flex flex-wrap gap-6">
                                {levelMap?.get(entry.entity_id) && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1">Level</p>
                                        <BaselLevelIndicator level={levelMap.get(entry.entity_id)!.current_level} title={levelMap.get(entry.entity_id)!.title} totalXp={levelMap.get(entry.entity_id)!.total_xp} xpToNextLevel={levelMap.get(entry.entity_id)!.xp_to_next_level} />
                                    </div>
                                )}
                                {entry.metadata?.role && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1">Role</p>
                                        <p className="text-sm font-bold text-base-content">{entry.metadata.role}</p>
                                    </div>
                                )}
                                {entry.metadata?.specialization && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1">Specialization</p>
                                        <p className="text-sm font-bold text-base-content">{entry.metadata.specialization}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
