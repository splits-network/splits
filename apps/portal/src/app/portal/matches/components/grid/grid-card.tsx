"use client";

import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    candidateInitials,
    jobDisplayTitle,
    companyDisplayName,
    isNewMatch,
    formatMatchDate,
    tierBadgeClass,
    tierLabel,
} from "../../types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

export function GridCard({
    match,
    isSelected,
    onSelect,
}: {
    match: EnrichedMatch;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const { getLevel } = useGamification();
    const candidateLevel = match.candidate_id ? getLevel(match.candidate_id) : undefined;
    const factors = match.match_factors;

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: score badge + NEW sparkle */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <MatchScoreBadge score={match.match_score} />
                {isNewMatch(match) && (
                    <span className="text-sm uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}
            </div>

            {/* Candidate avatar + name */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                        {candidateInitials(match)}
                    </div>
                    {candidateLevel && (
                        <div className="absolute -bottom-1 -right-1">
                            <LevelBadge level={candidateLevel} size="sm" />
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {candidateDisplayName(match)}
                </h3>
            </div>

            {/* Job title */}
            <div className="flex items-center gap-1 text-sm text-base-content/50 mb-1">
                <i className="fa-duotone fa-regular fa-briefcase" />
                {jobDisplayTitle(match)}
            </div>

            {/* Company */}
            <div className="flex items-center gap-1 text-sm font-semibold text-base-content/60 mb-4">
                <i className="fa-duotone fa-regular fa-building" />
                {companyDisplayName(match)}
            </div>

            {/* Factor chips */}
            <div className="flex flex-wrap gap-1 mb-4">
                <span
                    className={`badge badge-outline badge-sm ${factors.salary_overlap ? "badge-success" : "badge-error"}`}
                >
                    Salary
                </span>
                <span
                    className={`badge badge-outline badge-sm ${factors.location_compatible ? "badge-success" : "badge-error"}`}
                >
                    Location
                </span>
                <span
                    className={`badge badge-outline badge-sm ${factors.job_level_match ? "badge-success" : "badge-error"}`}
                >
                    Level
                </span>
                <span
                    className={`badge badge-outline badge-sm ${factors.employment_type_match ? "badge-success" : "badge-error"}`}
                >
                    Type
                </span>
            </div>

            {/* Footer: tier + date */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-base-200">
                <span
                    className={`text-sm uppercase tracking-wider font-bold px-2 py-0.5 ${tierBadgeClass(match.match_tier)}`}
                >
                    {tierLabel(match.match_tier)}
                </span>
                <span className="text-sm text-base-content/40">
                    <i className="fa-duotone fa-regular fa-calendar mr-1" />
                    {formatMatchDate(match.generated_at)}
                </span>
            </div>
        </div>
    );
}
