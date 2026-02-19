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
                    <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold text-[10px] flex-shrink-0">
                        {initials}
                    </div>
                    <h3 className="font-bold text-sm tracking-tight truncate">
                        {name}
                    </h3>
                </div>
                {recruiter.reputation_score && (
                    <span
                        className={`text-[9px] uppercase tracking-[0.15em] font-bold px-1.5 py-0.5 flex-shrink-0 ml-2 ${reputationColor(recruiter.reputation_score)}`}
                    >
                        {recruiter.reputation_score.toFixed(1)}
                    </span>
                )}
            </div>

            {/* Row 2: Tagline */}
            {recruiter.tagline && (
                <p className="text-xs font-semibold text-base-content/60 mb-1 truncate pl-[42px]">
                    {recruiter.tagline}
                </p>
            )}

            {/* Row 3: Location + Experience */}
            <div className="flex items-center justify-between pl-[42px]">
                <span className="text-xs text-base-content/40">
                    {recruiter.location && (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {recruiter.location}
                        </>
                    )}
                </span>
                <span className="text-xs font-bold text-primary">
                    {recruiter.total_placements ?? 0} placements
                </span>
            </div>

            {/* Row 4: Industries */}
            {recruiter.industries && recruiter.industries.length > 0 && (
                <div className="flex gap-1 mt-2 pl-[42px]">
                    {recruiter.industries.slice(0, 3).map((ind, i) => (
                        <span
                            key={i}
                            className="text-[8px] uppercase tracking-wider bg-base-200 text-base-content/40 px-1.5 py-0.5"
                        >
                            {ind}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
