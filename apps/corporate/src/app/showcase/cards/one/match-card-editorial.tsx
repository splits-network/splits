"use client";

import { BaselBadge, type BaselSemanticColor } from "@splits-network/basel-ui";
import type { MatchCardData } from "./data";

const statusConfig: Record<MatchCardData["status"], { label: string; color: BaselSemanticColor }> = {
    New: { label: "New", color: "info" },
    Reviewed: { label: "Reviewed", color: "warning" },
    Presented: { label: "Presented", color: "success" },
    Declined: { label: "Declined", color: "error" },
};

export function MatchCardEditorial({ match }: { match: MatchCardData }) {
    const status = statusConfig[match.status];

    const scoreColor =
        match.matchScore >= 90
            ? "text-success"
            : match.matchScore >= 75
              ? "text-warning"
              : "text-error";

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: recruiter + status badge */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {match.recruiterName}
                    </p>
                    <BaselBadge color={status.color} size="sm">{status.label}</BaselBadge>
                </div>

                {/* Dual avatars + match score */}
                <div className="flex items-end gap-4">
                    <div className="flex items-center shrink-0">
                        {/* Candidate avatar */}
                        <div className="w-16 h-16 bg-secondary text-secondary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {match.candidateInitials}
                        </div>
                        {/* Connector */}
                        <div className="flex items-center px-2 text-base-content/30">
                            <i className="fa-duotone fa-regular fa-arrow-right text-sm" />
                        </div>
                        {/* Company avatar */}
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {match.companyInitials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Match
                        </p>
                        <h2 className={`text-4xl font-black tracking-tight leading-none ${scoreColor}`}>
                            {match.matchScore}%
                        </h2>
                    </div>
                </div>
            </div>

            {/* Pairing Details */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Pairing
                </p>
                <p className="text-sm text-base-content leading-relaxed">
                    <span className="font-bold">{match.candidateName}</span>
                    <span className="text-base-content/40"> ({match.candidateTitle})</span>
                </p>
                <p className="text-sm text-base-content/60 flex items-center gap-1.5 mt-1">
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs text-primary" />
                    <span className="font-semibold">{match.roleTitle}</span>
                    <span className="text-base-content/40">at {match.company}</span>
                </p>
                <p className="text-sm text-base-content/40 mt-2 flex items-center gap-1.5">
                    <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                    {match.salaryAlignment}
                </p>
            </div>

            {/* Match Reasons */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Why It Matches
                </p>
                <ul className="space-y-2">
                    {match.matchReasons.map((reason) => (
                        <li
                            key={reason}
                            className="flex items-start gap-2 text-sm text-base-content/70 leading-relaxed"
                        >
                            <i className="fa-duotone fa-regular fa-check text-success text-xs mt-1 shrink-0" />
                            {reason}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Skills Section */}
            <div className="px-6 py-5 border-b border-base-300">
                {/* Matching Skills */}
                {match.skillOverlap.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                            Matching Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {match.skillOverlap.map((skill) => (
                                <BaselBadge key={skill} color="success" variant="soft" size="sm">{skill}</BaselBadge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing Skills */}
                {match.missingSkills.length > 0 && (
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                            Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {match.missingSkills.map((skill) => (
                                <BaselBadge key={skill} variant="outline" size="sm" className="opacity-40">{skill}</BaselBadge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: Status + Location Match */}
            <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                    <BaselBadge color={status.color} icon="fa-clipboard-check">{status.label}</BaselBadge>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${match.locationMatch ? "text-success" : "text-base-content/40"}`}>
                        <i className={`fa-duotone fa-regular fa-location-dot text-sm ${match.locationMatch ? "text-success" : "text-base-content/40"}`} />
                        {match.locationMatch ? "Location Match" : "No Location Match"}
                    </span>
                </div>
            </div>
        </article>
    );
}
