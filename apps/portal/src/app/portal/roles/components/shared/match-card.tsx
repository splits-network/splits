"use client";

import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { BaselBadge } from "@splits-network/basel-ui";
import { MatchCandidatePopup } from "./match-candidate-popup";
import { MatchRowActions } from "./match-row-actions";
import type { EnrichedMatch } from "@splits-network/shared-types";

interface Props {
    match: EnrichedMatch;
    onInvite: (matchId: string) => void;
    onDismiss: (matchId: string) => void;
    isInviting: boolean;
}

function initials(match: EnrichedMatch): string {
    const name = match.candidate?.full_name;
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const FACTORS = [
    { key: "salary_overlap", label: "Salary" },
    { key: "location_compatible", label: "Location" },
    { key: "job_level_match", label: "Level" },
    { key: "availability_compatible", label: "Availability" },
    { key: "employment_type_match", label: "Type" },
] as const;

export function MatchCard({ match, onInvite, onDismiss, isInviting }: Props) {
    const factors = match.match_factors;
    const skills = factors.skills_matched || [];
    const missing = factors.skills_missing || [];
    const candidateId = match.candidate_id;
    const name = match.candidate?.full_name || "Unknown Candidate";

    return (
        <div className="bg-base-100 p-4 space-y-2.5">
            {/* Row 1: Avatar + Name (popup trigger) + Score */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-base-300 text-sm font-bold text-primary shrink-0">
                    {initials(match)}
                </div>
                <div className="flex-1 min-w-0">
                    <MatchCandidatePopup candidateId={candidateId} candidateName={name} />
                </div>
                <MatchScoreBadge score={match.match_score} size="sm" />
            </div>

            {/* Row 2: Factor indicators */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {FACTORS.map(({ key, label }) => {
                    const value = factors[key];
                    if (value === undefined) return null;
                    return (
                        <span key={key} className="flex items-center gap-1">
                            <i className={`fa-solid fa-${value ? "check" : "xmark"} text-xs ${value ? "text-success" : "text-error"}`} />
                            <span className="text-base-content/60">{label}</span>
                        </span>
                    );
                })}
                {factors.skills_match_pct != null && (
                    <span className="flex items-center gap-1">
                        <i className="fa-duotone fa-regular fa-chart-simple text-xs text-info" />
                        <span className="text-base-content/60">Skills {Math.round(factors.skills_match_pct)}%</span>
                    </span>
                )}
            </div>

            {/* Row 3: Matched skills */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 4).map((skill) => (
                        <BaselBadge key={skill} color="neutral" size="xs" variant="outline">{skill}</BaselBadge>
                    ))}
                    {missing.length > 0 && missing.slice(0, 2).map((skill) => (
                        <span key={skill} className="line-through opacity-50">
                            <BaselBadge color="neutral" size="xs" variant="ghost">{skill}</BaselBadge>
                        </span>
                    ))}
                    {skills.length > 4 && (
                        <span className="text-sm text-base-content/40">+{skills.length - 4} more</span>
                    )}
                </div>
            )}

            {/* Row 4: AI summary (True Score only) */}
            {factors.ai_summary && (
                <p className="text-sm text-base-content/50 italic line-clamp-2 leading-snug">
                    &ldquo;{factors.ai_summary}&rdquo;
                </p>
            )}

            {/* Row 5: Actions */}
            <div className="flex justify-end">
                <MatchRowActions
                    match={match}
                    onInvite={onInvite}
                    onDismiss={onDismiss}
                    isInviting={isInviting}
                />
            </div>
        </div>
    );
}
