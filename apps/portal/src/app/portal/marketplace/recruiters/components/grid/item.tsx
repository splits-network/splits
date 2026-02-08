"use client";

import UserAvatar from "@/components/common/UserAvatar";
import RecruiterReputationBadge from "@/components/recruiter-reputation-badge";
import { RecruiterWithUser, getDisplayName } from "../../types";
import RecruiterActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: RecruiterWithUser;
    onViewDetails: (id: string) => void;
}

export default function Item({ item, onViewDetails }: ItemProps) {
    const displayName = getDisplayName(item);
    const specialties = item.specialties || [];
    const primarySpecialty = specialties[0] || null;

    return (
        <div className="card bg-base-100 border border-base-200 shadow-sm group hover:shadow-lg transition-all duration-200">
            <div className="card-body p-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <UserAvatar
                        user={{
                            name: displayName,
                            profile_image_url: item.users?.profile_image_url,
                        }}
                        size="md"
                        className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">
                            {displayName}
                        </h3>
                        <p className="text-xs text-base-content/60 truncate">
                            {item.tagline || item.location || "Recruiter"}
                        </p>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {primarySpecialty && (
                        <span className="badge badge-xs badge-primary badge-soft border-0">
                            <i className="fa-duotone fa-regular fa-briefcase text-[10px] mr-1"></i>
                            {primarySpecialty}
                        </span>
                    )}
                    {item.years_experience && (
                        <span className="badge badge-xs badge-ghost border-0">
                            <i className="fa-duotone fa-regular fa-calendar-clock text-[10px] mr-1"></i>
                            {item.years_experience}+ yrs
                        </span>
                    )}
                    {item.reputation_score !== undefined && (
                        <RecruiterReputationBadge
                            reputation={{
                                total_submissions: (item as any).total_submissions || 0,
                                total_hires: (item as any).total_hires || 0,
                                hire_rate: (item as any).hire_rate || 0,
                                completion_rate: (item as any).completion_rate || 0,
                                reputation_score: item.reputation_score,
                            }}
                            compact
                        />
                    )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mt-3 text-xs text-base-content/60">
                    {item.total_placements !== undefined &&
                        item.total_placements > 0 && (
                            <div className="flex items-center gap-1">
                                <i className="fa-duotone fa-regular fa-handshake text-success"></i>
                                <span>
                                    {item.total_placements} placements
                                </span>
                            </div>
                        )}
                    {item.success_rate !== undefined && (
                        <div className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-bullseye text-info"></i>
                            <span>{Math.round(item.success_rate)}%</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-200">
                    {item.location ? (
                        <span className="text-xs text-base-content/50 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-location-dot"></i>
                            {item.location}
                        </span>
                    ) : (
                        <span />
                    )}
                    <RecruiterActionsToolbar
                        recruiter={item}
                        variant="icon-only"
                        layout="horizontal"
                        size="xs"
                        showActions={{ viewDetails: true }}
                        onViewDetails={() => onViewDetails(item.id)}
                    />
                </div>
            </div>
        </div>
    );
}
