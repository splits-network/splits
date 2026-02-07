"use client";

import UserAvatar from "@/components/common/UserAvatar";
import { RecruiterWithUser, getDisplayName } from "../../types";

interface ListItemProps {
    item: RecruiterWithUser;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({ item, isSelected, onSelect }: ListItemProps) {
    const displayName = getDisplayName(item);
    const specialties = item.specialties || [];
    const primarySpecialty = specialties[0] || null;

    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
            `}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <UserAvatar
                    user={{
                        name: displayName,
                        profile_image_url: item.users?.profile_image_url,
                    }}
                    size="sm"
                    className="shrink-0"
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="truncate text-sm font-medium text-base-content/90">
                            {displayName}
                        </h3>
                    </div>

                    {/* Tagline or Location */}
                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {item.tagline || item.location || "Recruiter"}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {primarySpecialty && (
                            <span className="badge badge-xs badge-primary badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-briefcase text-[10px]"></i>
                                {primarySpecialty}
                            </span>
                        )}

                        {item.total_placements !== undefined &&
                            item.total_placements > 0 && (
                                <span className="badge badge-xs badge-success badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-regular fa-trophy text-[10px]"></i>
                                    {item.total_placements} placements
                                </span>
                            )}

                        {item.reputation_score !== undefined &&
                            item.reputation_score >= 80 && (
                                <span className="badge badge-xs badge-warning badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-regular fa-star text-[10px]"></i>
                                    Top Rated
                                </span>
                            )}
                    </div>
                </div>

                {/* Right side info */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    {item.years_experience && (
                        <span className="text-[10px] text-base-content/40">
                            {item.years_experience}+ yrs
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
                                const url = `${window.location.origin}${window.location.pathname}?recruiterId=${item.id}`;
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
