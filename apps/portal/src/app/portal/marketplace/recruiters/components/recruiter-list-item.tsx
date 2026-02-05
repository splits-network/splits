"use client";

import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";

interface RecruiterListItemProps {
    recruiter: MarketplaceRecruiterDTO;
    isSelected: boolean;
    onSelect: () => void;
}

export function RecruiterListItem({
    recruiter,
    isSelected,
    onSelect,
}: RecruiterListItemProps) {
    // Get initials for avatar
    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Format specialties for display
    const specialties = recruiter.marketplace_specialties || [];
    const primarySpecialty = specialties[0] || null;

    return (
        <div
            onClick={onSelect}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
            `}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="avatar placeholder shrink-0">
                    <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                        <span className="text-sm">{getInitials(recruiter.name)}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="truncate text-sm font-medium text-base-content/90">
                            {recruiter.name}
                        </h3>
                    </div>

                    {/* Tagline or Location */}
                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {recruiter.marketplace_tagline || recruiter.marketplace_location || "Recruiter"}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {primarySpecialty && (
                            <span className="badge badge-xs badge-primary badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-briefcase text-[10px]"></i>
                                {primarySpecialty}
                            </span>
                        )}

                        {recruiter.total_placements !== undefined && recruiter.total_placements > 0 && (
                            <span className="badge badge-xs badge-success badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-trophy text-[10px]"></i>
                                {recruiter.total_placements} placements
                            </span>
                        )}

                        {recruiter.reputation_score !== undefined && recruiter.reputation_score >= 80 && (
                            <span className="badge badge-xs badge-warning badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-star text-[10px]"></i>
                                Top Rated
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Actions - Visible on Hover/Selected */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    {recruiter.marketplace_years_experience && (
                        <span className="text-[10px] text-base-content/40">
                            {recruiter.marketplace_years_experience}+ yrs
                        </span>
                    )}

                    <div
                        className={`
                        flex gap-1 transition-opacity duration-200 mt-1
                        ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                    >
                        <button
                            className="btn btn-xs btn-square btn-ghost h-6 w-6"
                            title="Copy Profile Link"
                            onClick={(e) => {
                                e.stopPropagation();
                                const url = `${window.location.origin}${window.location.pathname}?recruiterId=${recruiter.id}`;
                                navigator.clipboard.writeText(url);
                            }}
                        >
                            <i className="fa-duotone fa-regular fa-link text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
