"use client";

import type { Candidate } from "../../types";
import {
    formatVerificationStatus,
    formatJobType,
    formatAvailability,
} from "../../types";
import { statusColor } from "../shared/status-color";
import {
    candidateName,
    candidateInitials,
    candidateTitle,
    candidateCompany,
    salaryDisplay,
    isNew,
    skillsList,
} from "../shared/helpers";
import CandidateActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
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
    const name = candidateName(candidate);
    const title = candidateTitle(candidate);
    const company = candidateCompany(candidate);
    const salary = salaryDisplay(candidate);
    const skills = skillsList(candidate);

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: verification status pill + NEW badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(candidate.verification_status)}`}
                >
                    {formatVerificationStatus(candidate.verification_status)}
                </span>

                {isNew(candidate) && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}

                {candidate.open_to_remote && (
                    <span className="text-[10px] uppercase tracking-wider bg-info/15 text-info px-2 py-1">
                        Remote
                    </span>
                )}
            </div>

            {/* Name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {name}
            </h3>
            {candidate.email && (
                <div className="text-sm text-base-content/40 truncate pb-1">
                    {candidate.email}
                </div>
            )}

            {/* Title */}
            {title ? (
                <div className="text-sm font-semibold text-base-content/60 mb-2">
                    {title}
                    {company && (
                        <span className="text-base-content/40">
                            {" "}
                            at {company}
                        </span>
                    )}
                </div>
            ) : (
                <div className="text-sm font-semibold text-base-content/60 mb-2">
                    {"No title specified"}
                </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-base-content/50 mb-4">
                <i className="fa-duotone fa-regular fa-location-dot" />
                {candidate.location || "Location not specified"}
            </div>

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {salary || "Salary Not specified"}
            </div>

            {/* Job type + Availability row */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-accent">
                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                    {formatJobType(candidate.desired_job_type)}
                </span>
                <span className="text-sm font-bold text-base-content/60">
                    <i className="fa-duotone fa-regular fa-clock mr-1" />
                    {formatAvailability(candidate.availability)}
                </span>
            </div>

            {/* Skills tags */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {skills.slice(0, 4).map((skill) => (
                        <span
                            key={skill}
                            className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1"
                        >
                            {skill}
                        </span>
                    ))}
                    {skills.length > 4 && (
                        <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                            +{skills.length - 4}
                        </span>
                    )}
                </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60 rounded-full">
                    {candidateInitials(name)}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-base-content truncate">
                        {name}
                    </div>
                </div>
            </div>

            {/* Footer: candidate avatar / initials left, actions right */}
            <div className="mt-auto flex items-center justify-end gap-3 pt-4 border-t border-base-200">
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <CandidateActionsToolbar
                        candidate={candidate}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
