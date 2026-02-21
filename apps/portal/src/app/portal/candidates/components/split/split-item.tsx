"use client";

import type { Candidate } from "../../types";
import { formatVerificationStatus, formatJobType } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    candidateName,
    candidateTitle,
    salaryDisplay,
    isNew,
    addedAgo,
} from "../shared/helpers";
import CandidateActionsToolbar from "../shared/actions-toolbar";

export function SplitItem({
    candidate,
    isSelected,
    onSelect,
    onRefresh,
}: {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const title = candidateTitle(candidate);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-4 py-2.5 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: name + added time */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(candidate) && (
                        <i className="fa-duotone fa-regular fa-star text-primary text-[10px] flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {candidateName(candidate)}
                    </h4>
                    <span
                        className={`inline-flex items-center px-1.5 py-px text-[10px] font-semibold flex-shrink-0 ${statusColor(
                            candidate.verification_status,
                        )}`}
                    >
                        {formatVerificationStatus(candidate.verification_status)}
                    </span>
                </div>
                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {addedAgo(candidate)}
                </span>
            </div>

            {/* Row 2: title + location */}
            <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-base-content/60 truncate">
                    {title || "No title"}
                </span>
                {candidate.location && (
                    <span className="text-[10px] text-base-content/40 flex-shrink-0 truncate max-w-[40%]">
                        <i className="fa-duotone fa-regular fa-location-dot mr-0.5" />
                        {candidate.location}
                    </span>
                )}
            </div>

            {/* Row 3: salary, job type, remote */}
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-base-content/60">
                    {salaryDisplay(candidate) || "Not specified"}
                </span>
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {formatJobType(candidate.desired_job_type)}
                </span>
                {candidate.open_to_remote && (
                    <span className="text-[10px] text-base-content/40">
                        <i className="fa-duotone fa-regular fa-wifi mr-0.5" />
                        Remote
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <CandidateActionsToolbar
                    candidate={candidate}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: false }}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
