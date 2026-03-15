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
        <div className="bg-base-100 p-4">
            {/* Row 1: Score block + Identity + Actions */}
            <div className="flex items-start gap-4">
                {/* Score as prominent visual anchor */}
                <div className="shrink-0">
                    <MatchScoreBadge score={match.match_score} size="md" />
                </div>

                {/* Identity + factors */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 border border-base-300 text-xs font-bold text-primary shrink-0">
                            {initials(match)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <MatchCandidatePopup candidateId={candidateId} candidateName={name} />
                        </div>
                    </div>

                    {/* Factor indicators — compact inline */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm mt-2">
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

                    {/* Skills + AI summary */}
                    {(skills.length > 0 || factors.ai_summary) && (
                        <div className="mt-2 space-y-1.5">
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {skills.slice(0, 4).map((skill) => (
                                        <BaselBadge key={skill} color="success" size="xs" variant="soft">{skill}</BaselBadge>
                                    ))}
                                    {missing.length > 0 && missing.slice(0, 2).map((skill) => (
                                        <BaselBadge key={skill} color="error" size="xs" variant="ghost">{skill}</BaselBadge>
                                    ))}
                                    {skills.length > 4 && (
                                        <span className="text-sm text-base-content/40">+{skills.length - 4} more</span>
                                    )}
                                </div>
                            )}
                            {factors.ai_summary && (
                                <p className="text-sm text-base-content/50 italic line-clamp-2 leading-snug">
                                    &ldquo;{factors.ai_summary}&rdquo;
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions — aligned top-right */}
                <div className="shrink-0">
                    <MatchRowActions
                        match={match}
                        onInvite={onInvite}
                        onDismiss={onDismiss}
                        isInviting={isInviting}
                    />
                </div>
            </div>
        </div>
    );
}
