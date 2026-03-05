"use client";

import { Fragment } from "react";
import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    jobDisplayTitle,
    companyDisplayName,
    formatMatchDate,
    matchStatusColor,
    formatMatchStatus,
    tierBadgeClass,
    tierLabel,
    isNewMatch,
} from "../../types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { MatchDetailLoader } from "../shared/match-detail-loader";

const COLUMNS = [
    "",
    "Candidate",
    "Job",
    "Company",
    "Score",
    "Tier",
    "Status",
    "Date",
] as const;

export function TableView({
    matches,
    onSelect,
    selectedId,
    isPartner,
    onDismiss,
    dismissing,
}: {
    matches: EnrichedMatch[];
    onSelect: (m: EnrichedMatch) => void;
    selectedId: string | null;
    isPartner: boolean;
    onDismiss?: (id: string) => void;
    dismissing?: boolean;
}) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {matches.map((match, idx) => {
                        const isSelected = selectedId === match.id;
                        const rowBase = isSelected
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

                        return (
                            <Fragment key={match.id}>
                                <tr
                                    onClick={() => onSelect(match)}
                                    className={`cursor-pointer transition-colors ${rowBase}`}
                                >
                                    {/* Chevron */}
                                    <td className="px-4 py-3 w-8">
                                        <i
                                            className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                                        />
                                    </td>

                                    {/* Candidate */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {isNewMatch(match) && (
                                                <i
                                                    className="fa-duotone fa-regular fa-sparkles text-sm text-warning"
                                                    title="Matched in the last 7 days"
                                                />
                                            )}
                                            <span className="font-bold text-sm text-base-content">
                                                {candidateDisplayName(match)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Job */}
                                    <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                                        {jobDisplayTitle(match)}
                                    </td>

                                    {/* Company */}
                                    <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                                        {companyDisplayName(match)}
                                    </td>

                                    {/* Score */}
                                    <td className="px-4 py-3">
                                        <MatchScoreBadge score={match.match_score} />
                                    </td>

                                    {/* Tier */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 text-sm uppercase tracking-[0.15em] font-bold ${tierBadgeClass(match.match_tier)}`}
                                        >
                                            {tierLabel(match.match_tier)}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 text-sm uppercase tracking-[0.15em] font-bold ${matchStatusColor(match.status)}`}
                                        >
                                            {formatMatchStatus(match.status)}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-3 text-sm text-base-content/50">
                                        {formatMatchDate(match.generated_at)}
                                    </td>
                                </tr>

                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td
                                            colSpan={COLUMNS.length}
                                            className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                                        >
                                            <MatchDetailLoader
                                                matchId={match.id}
                                                isPartner={isPartner}
                                                onClose={() => onSelect(match)}
                                                onDismiss={onDismiss}
                                                dismissing={dismissing}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
