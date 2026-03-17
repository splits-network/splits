import type { EnrichedMatch } from "../../../types";
import { FeatureGate } from "@/components/entitlements/feature-gate";
import { BaselBadge } from "@splits-network/basel-ui";

interface AITabProps {
    match: EnrichedMatch;
}

export function AITab({ match }: AITabProps) {
    return (
        <FeatureGate entitlement="ai_match_scoring">
            {match.ai_score === null ? (
                <div className="p-6 text-center text-base-content/40">
                    <i className="fa-duotone fa-regular fa-brain text-3xl mb-3 block" />
                    <p className="text-sm font-semibold">
                        No AI score available for this match yet
                    </p>
                </div>
            ) : (
                <div className="space-y-8 p-6">
                    <div className="bg-primary/5 border-l-4 border-l-primary p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fa-duotone fa-regular fa-brain text-primary" />
                            <span className="text-sm font-bold text-primary">
                                AI Score: {match.ai_score}
                            </span>
                            <span className="ml-auto">
                                <BaselBadge color="primary" size="xs" variant="soft">True Score</BaselBadge>
                            </span>
                        </div>
                        {match.match_factors.ai_summary && (
                            <p className="text-sm text-base-content/70 leading-relaxed">
                                {match.match_factors.ai_summary}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </FeatureGate>
    );
}
