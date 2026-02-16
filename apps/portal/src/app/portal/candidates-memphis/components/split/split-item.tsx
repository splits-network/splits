"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Candidate } from "../../types";
import { formatVerificationStatus } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    salaryDisplay,
    isNew,
    addedAgo,
    candidateName,
    candidateTitle,
    candidateCompany,
} from "../shared/helpers";

export function SplitItem({
    candidate,
    accent,
    isSelected,
    onSelect,
}: {
    candidate: Candidate;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const company = candidateCompany(candidate);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isNew(candidate) && (
                        <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-yellow" />
                    )}
                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                        {candidateName(candidate)}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {addedAgo(candidate)}
                </span>
            </div>
            <div className={`text-sm font-bold mb-1 ${ac.text}`}>
                {candidateTitle(candidate)}
                {company && (
                    <span className="text-dark/50 font-normal"> at {company}</span>
                )}
            </div>
            <div className="flex items-center justify-between">
                {candidate.location && (
                    <span className="text-sm text-dark/50">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {candidate.location}
                    </span>
                )}
                <Badge variant={statusVariant(candidate.verification_status)}>
                    {formatVerificationStatus(candidate.verification_status)}
                </Badge>
            </div>
            {salaryDisplay(candidate) && (
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-dark/70">
                        {salaryDisplay(candidate)}
                    </span>
                </div>
            )}
        </div>
    );
}
