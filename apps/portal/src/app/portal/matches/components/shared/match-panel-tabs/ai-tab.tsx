import type { EnrichedMatch } from "../../../types";
import { TrueScoreUpsell } from "@/components/matches/true-score-upsell";

interface AITabProps {
    match: EnrichedMatch;
    isPartner: boolean;
}

export function AITab({ match, isPartner }: AITabProps) {
    if (!isPartner || match.ai_score === null) {
        return (
            <div className="p-6">
                <TrueScoreUpsell />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div className="bg-primary/5 border-l-4 border-l-primary p-4">
                <div className="flex items-center gap-2 mb-2">
                    <i className="fa-duotone fa-regular fa-brain text-primary" />
                    <span className="text-sm font-bold text-primary">
                        AI Score: {match.ai_score}
                    </span>
                    <span className="badge badge-primary badge-sm ml-auto">
                        True Score
                    </span>
                </div>
                {match.match_factors.ai_summary && (
                    <p className="text-sm text-base-content/70 leading-relaxed">
                        {match.match_factors.ai_summary}
                    </p>
                )}
            </div>
        </div>
    );
}
