import type { EnrichedMatch } from "../../../types";
import { MatchFactorsSummary } from "@/components/matches/match-factors-summary";

interface FactorsTabProps {
    match: EnrichedMatch;
    isPartner: boolean;
}

export function FactorsTab({ match, isPartner }: FactorsTabProps) {
    const scores = [
        { label: "Rule Score", value: match.rule_score },
        { label: "Skills Score", value: match.skills_score },
        ...(isPartner && match.ai_score !== null
            ? [{ label: "AI Score", value: match.ai_score }]
            : []),
    ];

    return (
        <div className="space-y-8 p-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Match Factors
                </p>
                <MatchFactorsSummary factors={match.match_factors} />
            </div>

            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Score Breakdown
                </p>
                {scores.map((s) => (
                    <div key={s.label} className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-base-content/60">
                                {s.label}
                            </span>
                            <span className="text-sm font-bold">{s.value}</span>
                        </div>
                        <div className="h-2 bg-base-300 w-full">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${s.value}%` }}
                            />
                        </div>
                    </div>
                ))}
                <div className="border-t border-base-300 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold">Overall</span>
                    <span className="text-lg font-black text-primary">
                        {match.match_score}
                    </span>
                </div>
            </div>
        </div>
    );
}
