"use client";

import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    candidateInitials,
    jobDisplayTitle,
    companyDisplayName,
    isNewMatch,
    formatMatchDate,
    tierLabel,
} from "../../types";
import type { MatchTier } from "../../types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";

function tierBadgeColor(tier: MatchTier): "primary" | "neutral" {
    return tier === "true" ? "primary" : "neutral";
}

function companyInitials(match: EnrichedMatch): string {
    const name = companyDisplayName(match);
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

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

    const scoreColor =
        match.match_score >= 85
            ? "text-success"
            : match.match_score >= 70
              ? "text-warning"
              : "text-error";

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all",
                isSelected
                    ? "border-l-primary shadow-md"
                    : "border-l-base-300 shadow-sm hover:shadow-md hover:border-l-primary/50",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker row: tier + status */}
                <div className="flex items-center justify-between mb-3 min-w-0">
                    <BaselBadge color={tierBadgeColor(match.match_tier)} size="sm">
                        {tierLabel(match.match_tier)}
                    </BaselBadge>
                    {isNewMatch(match) ? (
                        <BaselBadge color="info" size="sm">New</BaselBadge>
                    ) : (
                        <MatchScoreBadge score={match.match_score} />
                    )}
                </div>

                {/* Dual avatars + match score */}
                <div className="flex items-end gap-3">
                    <div className="flex items-center shrink-0">
                        {/* Candidate avatar */}
                        <div className="relative">
                            <div className="w-14 h-14 bg-secondary text-secondary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                                {candidateInitials(match)}
                            </div>
                            {candidateLevel && (
                                <div className="absolute -bottom-1 -right-1">
                                    <LevelBadge level={candidateLevel} size="sm" />
                                </div>
                            )}
                        </div>
                        {/* Connector */}
                        <div className="flex items-center px-1.5 text-base-content/30">
                            <i className="fa-duotone fa-regular fa-arrow-right text-sm" />
                        </div>
                        {/* Company avatar */}
                        <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                            {companyInitials(match)}
                        </div>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Match
                        </p>
                        <p className={`text-4xl font-black tracking-tight leading-none truncate ${scoreColor}`}>
                            {match.match_score}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Pairing Details */}
            <div className="px-5 py-4 border-b border-base-300 min-w-0 overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Pairing
                </p>
                <p className="text-sm text-base-content leading-relaxed truncate">
                    <span className="font-bold">{candidateDisplayName(match)}</span>
                </p>
                <p className="text-sm text-base-content/60 flex items-center gap-1.5 mt-1 min-w-0">
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs text-primary shrink-0" />
                    <span className="font-semibold truncate">{jobDisplayTitle(match)}</span>
                    <span className="text-base-content/40 shrink-0">at</span>
                    <span className="text-base-content/40 truncate">{companyDisplayName(match)}</span>
                </p>
            </div>

            {/* AI Summary */}
            {factors.ai_summary && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        Summary
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {factors.ai_summary}
                    </p>
                </div>
            )}

            {/* Factor Indicators */}
            <div className="px-5 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Match Factors
                </p>
                <ul className="space-y-1.5">
                    {[
                        { label: "Salary", passed: factors.salary_overlap },
                        { label: "Location", passed: factors.location_compatible },
                        { label: "Level", passed: factors.job_level_match },
                        { label: "Type", passed: factors.employment_type_match },
                    ].map((f) => (
                        <li key={f.label} className="flex items-center gap-2 text-sm text-base-content/70">
                            <i
                                className={`fa-duotone fa-regular ${
                                    f.passed ? "fa-check text-success" : "fa-xmark text-error/50"
                                } text-xs shrink-0`}
                            />
                            {f.label}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Skills Preview */}
            {(factors.skills_matched.length > 0 || factors.skills_missing.length > 0) && (
                <div className="px-5 py-4 border-b border-base-300">
                    {factors.skills_matched.length > 0 && (
                        <div className={factors.skills_missing.length > 0 ? "mb-3" : ""}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                                Matching Skills
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {factors.skills_matched.slice(0, 4).map((skill) => (
                                    <BaselBadge key={skill} color="success" variant="soft" size="sm">
                                        {skill}
                                    </BaselBadge>
                                ))}
                                {factors.skills_matched.length > 4 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-base-content/40">
                                        +{factors.skills_matched.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {factors.skills_missing.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                                Missing
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {factors.skills_missing.slice(0, 3).map((skill) => (
                                    <BaselBadge key={skill} variant="outline" size="sm" className="opacity-40">
                                        {skill}
                                    </BaselBadge>
                                ))}
                                {factors.skills_missing.length > 3 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-base-content/40">
                                        +{factors.skills_missing.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer: date + location indicator */}
            <div className="mt-auto px-5 py-4">
                <div className="flex items-center justify-between min-w-0">
                    <span className="text-sm text-base-content/40 truncate">
                        <i className="fa-duotone fa-regular fa-calendar mr-1" />
                        {formatMatchDate(match.generated_at)}
                    </span>
                    <span
                        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider shrink-0 ${
                            factors.location_compatible ? "text-success" : "text-base-content/40"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-location-dot text-sm" />
                        {factors.location_compatible ? "Location" : "Remote"}
                    </span>
                </div>
            </div>
        </article>
    );
}
