"use client";

import { Fragment } from "react";
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
import { DetailLoader } from "../shared/candidate-detail";
import CandidateActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    candidate,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    candidate: Candidate;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            {/* Main row */}
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isNew(candidate) && (
                            <i
                                className="fa-duotone fa-regular fa-sparkles text-sm text-warning"
                                title="New in the last 7 days"
                            />
                        )}
                        <span className="font-bold text-sm text-base-content">
                            {candidateName(candidate)}
                        </span>
                    </div>
                </td>

                {/* Title */}
                <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                    {candidateTitle(candidate) || "\u2014"}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {candidate.location || "\u2014"}
                </td>

                {/* Verification Status */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(candidate.verification_status)}`}
                    >
                        {formatVerificationStatus(candidate.verification_status)}
                    </span>
                </td>

                {/* Job Type */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {formatJobType(candidate.desired_job_type)}
                </td>

                {/* Salary */}
                <td className="px-4 py-3 text-sm font-bold text-base-content">
                    {salaryDisplay(candidate) || "\u2014"}
                </td>

                {/* Added */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {addedAgo(candidate)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <CandidateActionsToolbar
                            candidate={candidate}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                viewDetails: false,
                            }}
                        />
                    </div>
                </td>
            </tr>

            {/* Expanded detail row */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <DetailLoader
                            candidateId={candidate.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
