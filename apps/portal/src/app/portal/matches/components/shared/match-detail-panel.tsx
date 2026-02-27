"use client";

import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    candidateInitials,
    jobDisplayTitle,
    companyDisplayName,
    matchStatusColor,
    formatMatchStatus,
    tierBadgeClass,
    tierLabel,
} from "../../types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { MatchFactorsSummary } from "@/components/matches/match-factors-summary";
import { TrueScoreUpsell } from "@/components/matches/true-score-upsell";

interface MatchDetailPanelProps {
    match: EnrichedMatch;
    isPartner: boolean;
    onClose?: () => void;
    onDismiss?: (id: string) => void;
    dismissing?: boolean;
}

export function MatchDetailPanel({
    match,
    isPartner,
    onClose,
    onDismiss,
    dismissing,
}: MatchDetailPanelProps) {
    const factors = match.match_factors;
    const skillsTotal = factors.skills_matched.length + factors.skills_missing.length;
    const skillsPct = skillsTotal > 0
        ? Math.round((factors.skills_matched.length / skillsTotal) * 100)
        : 0;

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 px-6 py-4 z-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center font-black text-lg flex-shrink-0">
                            {candidateInitials(match)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-1 truncate">
                                {candidateDisplayName(match)}
                            </h2>
                            <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                                <span>
                                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                                    {jobDisplayTitle(match)}
                                </span>
                                <span>
                                    <i className="fa-duotone fa-regular fa-building mr-1" />
                                    {companyDisplayName(match)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <MatchScoreBadge score={match.match_score} size="md" />
                                <span
                                    className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-0.5 ${tierBadgeClass(match.match_tier)}`}
                                >
                                    {tierLabel(match.match_tier)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Score
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {match.match_score}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Tier
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {tierLabel(match.match_tier)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <p className={`text-lg font-black tracking-tight`}>
                            <span className={`px-2 py-0.5 ${matchStatusColor(match.status)}`}>
                                {formatMatchStatus(match.status)}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Factor checklist */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Match Factors
                    </h3>
                    <MatchFactorsSummary factors={factors} />
                </div>

                {/* Skills section */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Skills ({skillsPct}% match)
                    </h3>
                    {factors.skills_matched.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {factors.skills_matched.map((skill) => (
                                <span
                                    key={skill}
                                    className="badge badge-success badge-outline badge-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                    {factors.skills_missing.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {factors.skills_missing.map((skill) => (
                                <span
                                    key={skill}
                                    className="badge badge-error badge-outline badge-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* True Score / AI section */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        AI Analysis
                    </h3>
                    {isPartner && match.ai_score ? (
                        <div className="bg-primary/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <i className="fa-duotone fa-regular fa-brain text-primary" />
                                <span className="text-sm font-bold text-primary">
                                    AI Score: {match.ai_score}
                                </span>
                            </div>
                            {factors.ai_summary && (
                                <p className="text-sm text-base-content/70 leading-relaxed">
                                    {factors.ai_summary}
                                </p>
                            )}
                        </div>
                    ) : (
                        <TrueScoreUpsell />
                    )}
                </div>

                {/* Actions */}
                {match.status === "active" && onDismiss && (
                    <div className="border-t-2 border-base-300 pt-6">
                        <button
                            onClick={() => onDismiss(match.id)}
                            disabled={dismissing}
                            className="btn btn-outline btn-error btn-sm"
                            style={{ borderRadius: 0 }}
                        >
                            {dismissing ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-xmark mr-1" />
                            )}
                            Dismiss Match
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
