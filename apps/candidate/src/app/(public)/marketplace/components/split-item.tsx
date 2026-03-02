"use client";

import type { Recruiter } from "../marketplace-client";
import { getInitials, reputationColor } from "./status-color";

interface SplitItemProps {
    recruiter: Recruiter;
    isSelected?: boolean;
    onSelect: (recruiter: Recruiter) => void;
}

export default function SplitItem({
    recruiter,
    isSelected,
    onSelect,
}: SplitItemProps) {
    const name = recruiter.users?.name || recruiter.name || "Unknown";
    const initials = getInitials(name);

    return (
        <div
            onClick={() => onSelect(recruiter)}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors ${
                isSelected ? "bg-primary/5 border-l-4 border-l-primary" : ""
            }`}
        >
            {/* Row 1: Avatar + Name + Rating */}
            <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                        {initials}
                    </div>
                    <h3 className="font-bold text-sm tracking-tight truncate">
                        {name}
                    </h3>
                </div>
                {recruiter.reputation_score && (
                    <span
                        className={`text-sm uppercase tracking-[0.15em] font-bold px-1.5 py-0.5 flex-shrink-0 ml-2 ${reputationColor(recruiter.reputation_score)}`}
                    >
                        {recruiter.reputation_score.toFixed(1)}
                    </span>
                )}
            </div>

            {/* Row 2: Tagline */}
            {recruiter.tagline && (
                <p className="text-sm font-semibold text-base-content/60 mb-1 truncate pl-[42px]">
                    {recruiter.tagline}
                </p>
            )}

            {/* Row 3: Location + Placements */}
            <div className="flex items-center justify-between pl-[42px]">
                <span className="text-sm text-base-content/40">
                    {recruiter.location && (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {recruiter.location}
                        </>
                    )}
                </span>
                <span className="text-sm font-bold text-primary">
                    {recruiter.total_placements ?? 0} placements
                </span>
            </div>

            {/* Row 4: Partnership + Industries */}
            <div className="flex flex-wrap gap-1 mt-2 pl-[42px]">
                {recruiter.company_recruiter && (
                    <span className="badge badge-sm badge-primary gap-1">
                        <i className="fa-duotone fa-regular fa-building" />
                        Company
                    </span>
                )}
                {recruiter.candidate_recruiter && (
                    <span className="badge badge-sm badge-secondary gap-1">
                        <i className="fa-duotone fa-regular fa-user-tie" />
                        Candidate
                    </span>
                )}
                {recruiter.industries?.slice(0, 2).map((ind) => (
                    <span
                        key={ind}
                        className="badge badge-sm badge-soft badge-outline"
                    >
                        {ind}
                    </span>
                ))}
            </div>
        </div>
    );
}
