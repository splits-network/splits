"use client";

import UserAvatar from "@/components/common/UserAvatar";
import { RecruiterDetailProps, RecruiterWithUser } from "./types";
import RecruiterActionsToolbar from "../recruiter-actions-toolbar";

interface RecruiterDetailHeaderProps extends RecruiterDetailProps {
    onInviteToCompany?: () => void;
    onMessage?: (
        conversationId: string,
        recruiterName: string,
        recruiterUserId: string,
    ) => void;
    showToolbar?: boolean;
}

export default function RecruiterDetailHeader({
    recruiter,
    onInviteToCompany,
    onMessage,
    showToolbar = true,
}: RecruiterDetailHeaderProps) {
    // Get name from joined users table or fallback
    const displayName =
        recruiter.users?.name ||
        recruiter.name ||
        recruiter.users?.email ||
        "Unknown Recruiter";

    const yearsExperience = recruiter.years_experience;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-5 items-start">
                <UserAvatar
                    user={{
                        name: displayName,
                        profile_image_url: recruiter.users?.profile_image_url,
                    }}
                    size="xl"
                />

                <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                            <h1 className="text-2xl font-bold text-base-content truncate">
                                {displayName}
                            </h1>
                            {yearsExperience && yearsExperience > 0 && (
                                <span className="badge badge-sm badge-primary gap-1">
                                    <i className="fa-duotone fa-regular fa-calendar-clock"></i>
                                    {yearsExperience}+ yrs
                                </span>
                            )}
                            {recruiter.total_placements !== undefined &&
                                recruiter.total_placements > 0 && (
                                    <span className="badge badge-sm badge-success gap-1">
                                        <i className="fa-duotone fa-regular fa-check-double"></i>
                                        {recruiter.total_placements} placements
                                    </span>
                                )}
                        </div>

                        {/* Actions Toolbar */}
                        {showToolbar && (
                            <div className="flex-shrink-0">
                                {/* Mobile: icon-only */}
                                <div className="md:hidden">
                                    <RecruiterActionsToolbar
                                        recruiter={recruiter}
                                        variant="icon-only"
                                        layout="horizontal"
                                        size="sm"
                                        onMessage={onMessage}
                                        onInviteToCompany={onInviteToCompany}
                                    />
                                </div>
                                {/* Desktop: descriptive */}
                                <div className="hidden md:block">
                                    <RecruiterActionsToolbar
                                        recruiter={recruiter}
                                        variant="descriptive"
                                        layout="horizontal"
                                        size="sm"
                                        onMessage={onMessage}
                                        onInviteToCompany={onInviteToCompany}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-lg text-base-content/80">
                        {recruiter.tagline || (
                            <span className="text-base-content/40 italic">
                                No tagline provided
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60 pt-1">
                        {recruiter.location && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-location-dot"></i>
                                {recruiter.location}
                            </div>
                        )}
                        {recruiter.users?.email && (
                            <a
                                href={`mailto:${recruiter.users.email}`}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                {recruiter.users.email}
                            </a>
                        )}
                        {recruiter.phone && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-phone"></i>
                                {recruiter.phone}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
