"use client";

import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    jobDisplayTitle,
    companyDisplayName,
    timeAgoMatch,
} from "../../types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";

export function SplitItem({
    match,
    isSelected,
    onSelect,
}: {
    match: EnrichedMatch;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: candidate name + time ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {candidateDisplayName(match)}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {timeAgoMatch(match.generated_at)}
                </span>
            </div>

            {/* Row 2: job title */}
            <div className="text-sm text-base-content/50 truncate mb-1">
                <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                {jobDisplayTitle(match)}
            </div>

            {/* Row 3: company + score */}
            <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-base-content/60 truncate">
                    <i className="fa-duotone fa-regular fa-building mr-1" />
                    {companyDisplayName(match)}
                </div>
                <MatchScoreBadge score={match.match_score} />
            </div>
        </div>
    );
}
