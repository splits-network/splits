"use client";

import { LeaderboardEntryInfo, EntityLevelInfo } from "../types";
import { LevelBadge } from "./level-badge";

interface LeaderboardPodiumProps {
    entries: LeaderboardEntryInfo[];
    myEntityId?: string;
    levelMap?: Map<string, EntityLevelInfo>;
}

const RANK_BORDER: Record<number, string> = {
    1: "border-warning",
    2: "border-base-content/40",
    3: "border-accent",
};

const RANK_ICON_COLOR: Record<number, string> = {
    1: "text-warning",
    2: "text-base-content/40",
    3: "text-accent",
};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) || "??").toUpperCase();
}

export function LeaderboardPodium({ entries, myEntityId, levelMap }: LeaderboardPodiumProps) {
    const top3 = entries.slice(0, 3);

    if (top3.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((entry) => {
                const isCurrentUser = myEntityId === entry.entity_id;
                const level = levelMap?.get(entry.entity_id);
                const borderColor = RANK_BORDER[entry.rank] || "border-base-content/20";
                const iconColor = RANK_ICON_COLOR[entry.rank] || "text-base-content/40";
                const name = entry.display_name || "Anonymous";
                const initials = getInitials(name);

                return (
                    <div
                        key={entry.id}
                        className={`rounded-none bg-base-200 shadow-sm p-6 border-l-4 ${borderColor} ${
                            entry.rank === 1 ? "md:-mt-4" : ""
                        } ${isCurrentUser ? "bg-primary/5" : ""}`}
                    >
                        <div className="flex flex-col items-center gap-3 text-center">
                            <i className={`fa-solid fa-trophy text-3xl ${iconColor}`} />

                            <div className="relative">
                                {entry.avatar_url ? (
                                    <img
                                        src={entry.avatar_url}
                                        alt=""
                                        className="w-14 h-14 rounded-none object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-none bg-base-300 flex items-center justify-center">
                                        <span className="text-lg font-bold text-base-content/50">{initials}</span>
                                    </div>
                                )}
                                {level && (
                                    <div className="absolute -bottom-1 -right-1">
                                        <LevelBadge level={level} size="sm" />
                                    </div>
                                )}
                            </div>

                            <span className="text-sm font-black text-base-content truncate max-w-full">
                                {name}
                            </span>

                            <span className="text-2xl font-black text-primary">
                                {entry.score.toLocaleString()}
                            </span>

                            {entry.metadata?.specialization && (
                                <span className="text-sm text-base-content/50">
                                    {entry.metadata.specialization}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
