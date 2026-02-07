"use client";

import { useMemo } from "react";
import UserAvatar from "@/components/common/UserAvatar";
import { useRecruiterFilter } from "../../contexts/filter-context";
import { RecruiterWithUser, getDisplayName } from "../../types";
import RecruiterActionsToolbar from "../shared/actions-toolbar";

interface DetailHeaderProps {
    id: string;
    onClose: () => void;
}

export default function DetailHeader({ id, onClose }: DetailHeaderProps) {
    const { data } = useRecruiterFilter();

    const recruiter = useMemo(
        () => data.find((r) => r.id === id) || null,
        [data, id],
    );

    if (!recruiter) return null;

    const displayName = getDisplayName(recruiter);

    return (
        <div className="border-b border-base-300 bg-base-100">
            {/* Mobile Back Button */}
            <div className="flex md:hidden items-center p-4">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm mr-3"
                    aria-label="Back to list"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                </button>
                <h3 className="text-lg font-semibold flex-1 truncate">
                    Recruiter Profile
                </h3>
            </div>

            {/* Header content */}
            <div className="p-6 pb-4">
                <div className="flex gap-5 items-start">
                    <UserAvatar
                        user={{
                            name: displayName,
                            profile_image_url:
                                recruiter.users?.profile_image_url,
                        }}
                        size="xl"
                    />

                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-wrap min-w-0">
                                <h1 className="text-2xl font-bold text-base-content truncate">
                                    {displayName}
                                </h1>
                                {recruiter.years_experience &&
                                    recruiter.years_experience > 0 && (
                                        <span className="badge badge-sm badge-primary gap-1">
                                            <i className="fa-duotone fa-regular fa-calendar-clock"></i>
                                            {recruiter.years_experience}+ yrs
                                        </span>
                                    )}
                                {recruiter.total_placements !== undefined &&
                                    recruiter.total_placements > 0 && (
                                        <span className="badge badge-sm badge-success gap-1">
                                            <i className="fa-duotone fa-regular fa-check-double"></i>
                                            {recruiter.total_placements}{" "}
                                            placements
                                        </span>
                                    )}
                            </div>

                            {/* Actions Toolbar */}
                            <div className="flex-shrink-0">
                                <div className="md:hidden">
                                    <RecruiterActionsToolbar
                                        recruiter={recruiter}
                                        variant="icon-only"
                                        layout="horizontal"
                                        size="sm"
                                    />
                                </div>
                                <div className="hidden md:block">
                                    <RecruiterActionsToolbar
                                        recruiter={recruiter}
                                        variant="descriptive"
                                        layout="horizontal"
                                        size="sm"
                                    />
                                </div>
                            </div>
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
        </div>
    );
}
