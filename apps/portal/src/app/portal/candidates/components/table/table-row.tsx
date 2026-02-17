"use client";

import { Fragment } from "react";
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
    candidateInitials,
    candidateTitle,
    candidateCompany,
    skillsList,
} from "../shared/helpers";
import { DetailLoader } from "../shared/candidate-detail";
import CandidateActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    candidate,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    candidate: Candidate;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const name = candidateName(candidate);
    const initials = candidateInitials(name);
    const title = candidateTitle(candidate);
    const company = candidateCompany(candidate);
    const skills = skillsList(candidate);

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `${ac.bgLight} ${ac.border}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                }`}
            >
                {/* Accent indicator / chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                    />
                </td>

                {/* Name + avatar initials */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full ${ac.bg} flex items-center justify-center`}
                        >
                            <span className={`text-xs font-black ${ac.textOnBg}`}>
                                {initials}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            {isNew(candidate) && (
                                <i className="fa-duotone fa-regular fa-sparkles text-sm text-yellow flex-shrink-0" />
                            )}
                            <span className="font-black text-sm text-dark uppercase truncate">
                                {name}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Title + company */}
                <td className="px-4 py-3">
                    <div className="min-w-0">
                        <span className="text-sm font-bold text-dark block truncate">
                            {title}
                        </span>
                        {company && (
                            <span className={`text-xs font-semibold ${ac.text} block truncate`}>
                                {company}
                            </span>
                        )}
                    </div>
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-dark/70">
                    {candidate.location ? (
                        <div className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot text-xs text-dark/40" />
                            <span className="truncate">{candidate.location}</span>
                        </div>
                    ) : (
                        "—"
                    )}
                </td>

                {/* Salary range */}
                <td className="px-4 py-3 text-sm font-bold text-dark">
                    {salaryDisplay(candidate) || "—"}
                </td>

                {/* Verification status */}
                <td className="px-4 py-3">
                    <Badge color={statusVariant(candidate.verification_status)}>
                        {formatVerificationStatus(candidate.verification_status)}
                    </Badge>
                </td>

                {/* Skills */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                        {skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} color="purple">
                                {skill}
                            </Badge>
                        ))}
                        {skills.length > 3 && (
                            <span className="text-xs font-bold text-dark/50">
                                +{skills.length - 3}
                            </span>
                        )}
                        {skills.length === 0 && (
                            <span className="text-xs text-dark/40">—</span>
                        )}
                    </div>
                </td>

                {/* Added ago */}
                <td className="px-4 py-3 text-sm text-dark/60">
                    {addedAgo(candidate)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
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

            {/* Expandable detail row */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className={`border-t-4 border-b-4 ${ac.border}`}
                    >
                        <DetailLoader
                            candidateId={candidate.id}
                            accent={ac}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
