"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
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
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {isNew(recruiter) && (
                    <Badge color="yellow" className="mb-2" size="sm">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </Badge>
                )}

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-2">
                    {recruiter.users?.profile_image_url ? (
                        <img
                            src={recruiter.users.profile_image_url}
                            alt={name}
                            className={`w-12 h-12 object-cover border-2 ${ac.border}`}
                        />
                    ) : (
                        <div
                            className={`w-12 h-12 flex items-center justify-center border-2 ${ac.border} ${ac.bg} ${ac.textOnBg} text-sm font-bold`}
                        >
                            {getInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="font-black text-base uppercase tracking-tight leading-tight text-dark truncate">
                            {name}
                        </h3>
                        {recruiter.tagline && (
                            <div className={`text-sm font-bold truncate ${ac.text}`}>
                                {recruiter.tagline}
                            </div>
                        )}
                    </div>
                </div>

                {location && (
                    <div className="flex items-center gap-1 text-sm mb-3 text-dark/60">
                        <i className="fa-duotone fa-regular fa-location-dot" />
                        {location}
                    </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-black text-dark">
                        <i className="fa-duotone fa-regular fa-handshake mr-1" />
                        {placementsDisplay(recruiter)} placements
                    </span>
                    {successRateDisplay(recruiter) && (
                        <span className="text-sm font-bold text-purple">
                            <i className="fa-duotone fa-regular fa-bullseye mr-1" />
                            {successRateDisplay(recruiter)}
                        </span>
                    )}
                </div>

                {/* Specialties + Experience */}
                <div className="flex flex-wrap gap-1">
                    {experienceDisplay(recruiter) && (
                        <Badge color="dark" variant="outline">
                            {experienceDisplay(recruiter)}
                        </Badge>
                    )}
                    {(recruiter.specialties || []).slice(0, 2).map((s, i) => (
                        <Badge
                            key={`specialty-${i}`}
                            color={ac.name}
                            variant="outline"
                        >
                            {s}
                        </Badge>
                    ))}
                    {(recruiter.specialties || []).length > 2 && (
                        <Badge color="dark" variant="outline">
                            +{(recruiter.specialties || []).length - 2}
                        </Badge>
                    )}
                </div>
            </div>

            <div
                className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}
            >
                <Badge color={statusVariant(recruiter.marketplace_profile?.status || "active")}>
                    {formatStatus(recruiter.marketplace_profile?.status || "active")}
                </Badge>
                <div className="shrink-0">
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
        </Card>
    );
}
