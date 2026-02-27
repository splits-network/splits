import type { EnrichedMatch } from "@splits-network/shared-types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";

interface MatchOverviewCardProps {
    match: EnrichedMatch;
}

export function MatchOverviewCard({ match }: MatchOverviewCardProps) {
    const candidateName = match.candidate?.full_name || "Unnamed candidate";

    const candidateInitial = candidateName[0]?.toUpperCase() || "?";

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Candidate info */}
                    <div className="flex flex-col items-center text-center flex-1">
                        <div className="avatar avatar-placeholder mb-2">
                            <div className="bg-base-300 text-base-content rounded-full w-14">
                                <span className="text-lg">{candidateInitial}</span>
                            </div>
                        </div>
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/60">candidate</p>
                    </div>

                    {/* Score badge center */}
                    <div className="flex flex-col items-center gap-2">
                        <MatchScoreBadge score={match.match_score} size="lg" />
                        <span className={`badge badge-sm ${match.match_tier === "true" ? "badge-primary" : "badge-ghost"}`}>
                            {match.match_tier === "true" ? "True Score" : "Standard Score"}
                        </span>
                    </div>

                    {/* Job info */}
                    <div className="flex flex-col items-center text-center flex-1">
                        <div className="avatar avatar-placeholder mb-2">
                            <div className="bg-base-300 text-base-content rounded-full w-14">
                                {match.job?.companies?.logo_url ? (
                                    <img src={match.job.companies.logo_url} alt={match.job.companies.name} />
                                ) : (
                                    <span className="text-lg">
                                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="font-semibold">{match.job?.title || "Untitled role"}</p>
                        <p className="text-sm text-base-content/60">
                            {match.job?.companies?.name || "Company not listed"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
