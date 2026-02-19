"use client";

import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    joinedAgo,
    isNew,
} from "../shared/helpers";

export function SplitItem({
    recruiter,
    isSelected,
    onSelect,
}: {
    recruiter: RecruiterWithUser;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.marketplace_profile?.status || "active";

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: avatar + name + posted time */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-3 min-w-0">
                    {recruiter.users?.profile_image_url ? (
                        <img
                            src={recruiter.users.profile_image_url}
                            alt={name}
                            className="w-8 h-8 object-cover border border-base-300 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 flex items-center justify-center border border-base-300 bg-base-200 text-xs font-bold text-base-content/60 flex-shrink-0">
                            {getInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            {isNew(recruiter) && (
                                <i className="fa-duotone fa-regular fa-star text-primary text-xs flex-shrink-0" />
                            )}
                            <h4 className="font-bold text-sm tracking-tight truncate">
                                {name}
                            </h4>
                        </div>
                        {recruiter.tagline && (
                            <div className="text-sm font-semibold truncate text-primary/70">
                                {recruiter.tagline}
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {joinedAgo(recruiter)}
                </span>
            </div>

            {/* Row 2: location + status */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 truncate">
                    {location ? (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {location}
                        </>
                    ) : null}
                </div>
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(status)}`}
                >
                    {formatStatus(status)}
                </span>
            </div>

            {/* Row 3: placements + success rate */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-base-content/70">
                    {placementsDisplay(recruiter)} placements
                </span>
                {successRateDisplay(recruiter) && (
                    <span className="text-sm font-bold text-accent">
                        {successRateDisplay(recruiter)} success
                    </span>
                )}
            </div>
        </div>
    );
}
