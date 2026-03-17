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
    tierBadgeColor,
} from "../../types";
import { useGamification } from "@splits-network/shared-gamification";
import { BaselBadge, BaselAvatar, BaselLevelIndicator } from "@splits-network/basel-ui";

function companyInitials(match: EnrichedMatch): string {
    const name = companyDisplayName(match);
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function scoreColor(score: number): string {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-error";
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

    const skillsPct = factors.skills_match_pct ?? 0;
    const skillsColor = skillsPct >= 75 ? "text-success" : skillsPct >= 50 ? "text-warning" : "text-error/50";

    // Inline metadata
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-code", color: skillsColor, value: `${Math.round(skillsPct)}% skills`, muted: false, tooltip: `Skills match: ${factors.skills_matched.length} matched, ${factors.skills_missing.length} missing` },
        { icon: "fa-dollar-sign", color: factors.salary_overlap ? "text-success" : "text-error/50", value: factors.salary_overlap ? "Salary match" : "Salary gap", muted: false, tooltip: "Salary overlap" },
        { icon: "fa-location-dot", color: factors.location_compatible ? "text-success" : "text-error/50", value: factors.location_compatible ? "Location match" : "Location mismatch", muted: false, tooltip: "Location compatibility" },
        { icon: "fa-briefcase", color: factors.employment_type_match ? "text-success" : "text-error/50", value: factors.employment_type_match ? "Type match" : "Type mismatch", muted: false, tooltip: "Employment type match" },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary bg-primary/5"
                    : "border-l-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Dual avatars + Name block */}
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5 w-14 h-14">
                        <div className="absolute top-0 left-0 z-10">
                            <BaselAvatar
                                initials={candidateInitials(match)}
                                size="sm"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0">
                            <BaselAvatar
                                initials={companyInitials(match)}
                                size="sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {companyDisplayName(match)}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {candidateDisplayName(match)}
                        </h3>
                        <p className="text-sm truncate mt-0.5 text-base-content/50">
                            {jobDisplayTitle(match)}
                        </p>
                    </div>
                    {/* Match score */}
                    <div className="text-right shrink-0 pl-2 pt-0.5">
                        <span className={`text-xl font-black leading-none ${scoreColor(match.match_score)}`}>
                            {match.match_score}%
                        </span>
                        <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 block mt-0.5">
                            Match
                        </span>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-calendar text-xs text-accent" />
                        {formatMatchDate(match.generated_at)}
                    </span>
                </div>
            </div>

            {/* Inline metadata: factor indicators */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {candidateLevel && (
                    <>
                        <BaselLevelIndicator level={candidateLevel.current_level} title={candidateLevel.title} totalXp={candidateLevel.total_xp} xpToNextLevel={candidateLevel.xp_to_next_level} />
                        <span className="text-base-content/20">&middot;</span>
                    </>
                )}
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* AI Summary snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {factors.ai_summary ? (
                    <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        {factors.ai_summary}
                    </p>
                ) : (
                    <p className="text-sm text-base-content/30">No AI summary available</p>
                )}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    <BaselBadge color={tierBadgeColor(match.match_tier)} variant="soft-outline" size="sm">
                        {tierLabel(match.match_tier)}
                    </BaselBadge>
                    {isNewMatch(match) && (
                        <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                    {factors.skills_matched.slice(0, 3).map((skill) => (
                        <BaselBadge key={skill} color="success" variant="soft" size="sm">
                            {skill}
                        </BaselBadge>
                    ))}
                    {factors.skills_matched.length > 3 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{factors.skills_matched.length - 3} more
                        </span>
                    )}
                    {factors.skills_missing.slice(0, 2).map((skill) => (
                        <BaselBadge key={skill} color="neutral" variant="soft" size="sm" className="opacity-50">
                            {skill}
                        </BaselBadge>
                    ))}
                    {factors.skills_missing.length > 2 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{factors.skills_missing.length - 2} missing
                        </span>
                    )}
                    {factors.skills_matched.length === 0 && factors.skills_missing.length === 0 && (
                        <span className="text-sm text-base-content/30">No skills data</span>
                    )}
                </div>
            </div>

            {/* Footer: location indicator */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-base-300">
                <span className={`text-sm truncate ${factors.location_compatible ? "text-base-content/40" : "text-base-content/30"}`}>
                    <i className={`fa-duotone fa-regular fa-location-dot mr-1 ${factors.location_compatible ? "text-success" : "text-base-content/20"}`} />
                    {factors.location_compatible ? "Location compatible" : "Remote only"}
                </span>
            </div>
        </article>
    );
}
