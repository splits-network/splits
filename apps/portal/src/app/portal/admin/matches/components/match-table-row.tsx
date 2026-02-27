import Link from "next/link";
import type { EnrichedMatch } from "@splits-network/shared-types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";

interface MatchTableRowProps {
    match: EnrichedMatch;
    onDismiss: (id: string) => void;
    dismissing: boolean;
}

export function MatchTableRow({ match, onDismiss, dismissing }: MatchTableRowProps) {
    const candidateName = match.candidate?.full_name || "Unknown";

    const candidateInitial = candidateName[0]?.toUpperCase() || "?";

    return (
        <tr className="hover">
            {/* Candidate */}
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-base-300 text-base-content rounded-full w-8">
                            <span className="text-sm">{candidateInitial}</span>
                        </div>
                    </div>
                    <span className="font-medium">{candidateName}</span>
                </div>
            </td>
            {/* Job */}
            <td className="text-sm">{match.job?.title || "Unknown"}</td>
            {/* Company */}
            <td className="text-sm">{match.job?.companies?.name || "-"}</td>
            {/* Match Quality */}
            <td><MatchScoreBadge score={match.match_score} /></td>
            {/* Tier */}
            <td>
                <span className={`badge badge-sm ${match.match_tier === "true" ? "badge-primary" : "badge-ghost"}`}>
                    {match.match_tier === "true" ? "True" : "Standard"}
                </span>
            </td>
            {/* Date */}
            <td className="text-sm">{new Date(match.generated_at).toLocaleDateString()}</td>
            {/* Actions */}
            <td>
                <div className="flex gap-1">
                    <Link href={`/portal/admin/matches/${match.id}`} className="btn btn-xs btn-ghost" title="View details">
                        <i className="fa-duotone fa-regular fa-eye"></i>
                    </Link>
                    {match.status === "active" && (
                        <button
                            className="btn btn-xs btn-ghost text-error"
                            title="Dismiss match"
                            onClick={() => onDismiss(match.id)}
                            disabled={dismissing}
                        >
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
