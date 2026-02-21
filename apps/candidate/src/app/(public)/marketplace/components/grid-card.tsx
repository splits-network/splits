"use client";

import Link from "next/link";
import type { Recruiter } from "../marketplace-client";
import ReputationDisplay from "./reputation-display";
import { getInitials, reputationColor } from "./status-color";

interface GridCardProps {
    recruiter: Recruiter;
    isSelected?: boolean;
    onSelect?: (recruiter: Recruiter) => void;
}

export default function GridCard({
    recruiter,
    isSelected,
    onSelect,
}: GridCardProps) {
    const name = recruiter.users?.name || recruiter.name || "Unknown Recruiter";
    const initials = getInitials(name);

    return (
        <div
            onClick={() => onSelect?.(recruiter)}
            className={`recruiter-card group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all hover:shadow-md ${
                isSelected
                    ? "border-primary border-l-4"
                    : "border-base-300 hover:border-primary/30"
            }`}
        >
            {/* Top row: reputation pill + experience */}
            <div className="flex items-center justify-between mb-4">
                {recruiter.reputation_score ? (
                    <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${reputationColor(recruiter.reputation_score)}`}
                    >
                        <i className="fa-duotone fa-regular fa-star mr-1" />
                        {recruiter.reputation_score.toFixed(1)} Rating
                    </span>
                ) : (
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-base-content/10 text-base-content/40">
                        New
                    </span>
                )}
                {recruiter.years_experience &&
                    recruiter.years_experience >= 5 && (
                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-accent/15 text-accent">
                            {recruiter.years_experience}+ yrs
                        </span>
                    )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary font-black text-sm flex-shrink-0">
                    {initials}
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary truncate">
                        {name}
                    </h3>
                    {recruiter.tagline && (
                        <p className="text-sm font-semibold text-base-content/60 truncate">
                            {recruiter.tagline}
                        </p>
                    )}
                </div>
            </div>

            {/* Bio excerpt */}
            {recruiter.bio && (
                <p className="text-sm text-base-content/50 leading-relaxed line-clamp-2 mb-4">
                    {recruiter.bio}
                </p>
            )}

            {/* Meta: Location + Specialization */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50 mb-4">
                {recruiter.location && (
                    <span>
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {recruiter.location}
                    </span>
                )}
                {recruiter.specialization && (
                    <span>
                        <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                        {recruiter.specialization}
                    </span>
                )}
                {recruiter.years_experience && (
                    <span>
                        <i className="fa-duotone fa-regular fa-clock mr-1" />
                        {recruiter.years_experience} yrs exp
                    </span>
                )}
            </div>

            {/* Industries tags */}
            {recruiter.industries && recruiter.industries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {recruiter.industries.slice(0, 3).map((industry, i) => (
                        <span
                            key={i}
                            className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1"
                        >
                            {industry}
                        </span>
                    ))}
                    {recruiter.industries.length > 3 && (
                        <span className="text-[9px] uppercase tracking-wider text-base-content/30 px-2 py-1">
                            +{recruiter.industries.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer: reputation + view profile */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-base-200">
                <ReputationDisplay
                    score={recruiter.reputation_score}
                    placements={recruiter.total_placements}
                />
                <Link
                    href={`/marketplace/${recruiter.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors"
                >
                    View
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </Link>
            </div>
        </div>
    );
}
