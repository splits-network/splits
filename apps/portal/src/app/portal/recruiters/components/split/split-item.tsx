"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
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
    accent,
    isSelected,
    onSelect,
}: {
    recruiter: RecruiterWithUser;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-3 min-w-0">
                    {recruiter.users?.profile_image_url ? (
                        <img
                            src={recruiter.users.profile_image_url}
                            alt={name}
                            className={`w-8 h-8 object-cover border-2 ${ac.border} flex-shrink-0`}
                        />
                    ) : (
                        <div
                            className={`w-8 h-8 flex items-center justify-center border-2 ${ac.border} bg-cream text-xs font-bold text-dark flex-shrink-0`}
                        >
                            {getInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {isNew(recruiter) && (
                                <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-yellow" />
                            )}
                            <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                                {name}
                            </h4>
                        </div>
                        {recruiter.tagline && (
                            <div className={`text-sm font-bold truncate ${ac.text}`}>
                                {recruiter.tagline}
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {joinedAgo(recruiter)}
                </span>
            </div>
            <div className="flex items-center justify-between mt-1">
                {location && (
                    <span className="text-sm text-dark/50">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {location}
                    </span>
                )}
                <Badge color={statusVariant(recruiter.marketplace_profile?.status || "active")}>
                    {formatStatus(recruiter.marketplace_profile?.status || "active")}
                </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold text-dark/70">
                    {placementsDisplay(recruiter)} placements
                </span>
                {successRateDisplay(recruiter) && (
                    <span className="text-sm font-bold text-purple">
                        {successRateDisplay(recruiter)} success
                    </span>
                )}
            </div>
        </div>
    );
}
