"use client";

import { LeaderboardEntryInfo } from "../types";

interface LeaderboardRowProps {
    entry: LeaderboardEntryInfo;
    isCurrentUser?: boolean;
    displayName?: string;
    avatarUrl?: string;
}

const RANK_STYLES: Record<number, string> = {
    1: "text-warning font-black",
    2: "text-base-content/60 font-black",
    3: "text-accent font-black",
};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) || "??").toUpperCase();
}

export function LeaderboardRow({ entry, isCurrentUser, displayName, avatarUrl }: LeaderboardRowProps) {
    const rankStyle = RANK_STYLES[entry.rank] || "text-base-content/40 font-bold";
    const name = displayName || entry.display_name || "Anonymous";
    const avatar = avatarUrl || entry.avatar_url;
    const initials = getInitials(name);

    return (
        <div
            className={`flex items-center gap-4 px-4 py-3 ${
                isCurrentUser ? "bg-primary/5 border-l-2 border-primary" : ""
            }`}
        >
            <span className={`w-8 text-center text-sm ${rankStyle}`}>
                {entry.rank <= 3 ? (
                    <i className={`fa-solid fa-trophy ${entry.rank === 1 ? "text-warning" : entry.rank === 2 ? "text-base-content/40" : "text-accent"}`} />
                ) : (
                    `#${entry.rank}`
                )}
            </span>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {avatar ? (
                    <img src={avatar} alt="" className="w-8 h-8 rounded-none object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-none bg-base-300 flex items-center justify-center">
                        <span className="text-sm font-bold text-base-content/50">{initials}</span>
                    </div>
                )}
                <span className={`text-sm font-bold truncate ${isCurrentUser ? "text-primary" : "text-base-content"}`}>
                    {name}
                </span>
            </div>
            <span className="text-sm font-black text-base-content/60">
                {typeof entry.score === "number" ? entry.score.toLocaleString() : entry.score}
            </span>
        </div>
    );
}
