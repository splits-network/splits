"use client";

import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    experienceDisplay,
    isNew,
} from "../shared/helpers";
import RecruiterActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    recruiter,
    isSelected,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.marketplace_profile?.status || "active";

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Status + NEW */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(status)}`}
                >
                    {formatStatus(status)}
                </span>

                {isNew(recruiter) && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-2">
                {recruiter.users?.profile_image_url ? (
                    <img
                        src={recruiter.users.profile_image_url}
                        alt={name}
                        className="w-12 h-12 object-cover border-2 border-primary"
                    />
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-primary bg-primary/10 text-primary text-sm font-bold">
                        {getInitials(name)}
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-base font-black tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                        {name}
                    </h3>
                    {recruiter.tagline && (
                        <div className="text-sm font-semibold truncate text-primary/70">
                            {recruiter.tagline}
                        </div>
                    )}
                </div>
            </div>

            {/* Location */}
            {location && (
                <div className="flex items-center gap-1 text-sm mb-3 text-base-content/50">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {location}
                </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-base-content">
                    <i className="fa-duotone fa-regular fa-handshake mr-1" />
                    {placementsDisplay(recruiter)} placements
                </span>
                {successRateDisplay(recruiter) && (
                    <span className="text-sm font-bold text-accent">
                        <i className="fa-duotone fa-regular fa-bullseye mr-1" />
                        {successRateDisplay(recruiter)}
                    </span>
                )}
            </div>

            {/* Specialties + Experience */}
            <div className="flex flex-wrap gap-1 mb-4">
                {experienceDisplay(recruiter) && (
                    <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                        {experienceDisplay(recruiter)}
                    </span>
                )}
                {(recruiter.specialties || []).slice(0, 2).map((s, i) => (
                    <span
                        key={`specialty-${i}`}
                        className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-1"
                    >
                        {s}
                    </span>
                ))}
                {(recruiter.specialties || []).length > 2 && (
                    <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                        +{(recruiter.specialties || []).length - 2}
                    </span>
                )}
            </div>

            {/* Footer: actions */}
            <div
                className="flex items-center justify-end gap-3 pt-4 border-t border-base-200"
                onClick={(e) => e.stopPropagation()}
            >
                <RecruiterActionsToolbar
                    recruiter={recruiter}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                    showActions={{
                        viewDetails: false,
                        message: false,
                    }}
                />
            </div>
        </div>
    );
}
