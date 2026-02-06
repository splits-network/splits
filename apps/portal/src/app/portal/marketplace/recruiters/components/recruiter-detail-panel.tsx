"use client";

import React from "react";
import {
    RecruiterDetailHeader,
    RecruiterDetailStats,
    RecruiterDetailBio,
    RecruiterDetailSpecialties,
    RecruiterDetailIndustries,
    RecruiterDetailExperience,
    RecruiterDetailContact,
    RecruiterWithUser,
} from "./detail";

interface RecruiterDetailPanelProps {
    recruiter: RecruiterWithUser | null;
    loading?: boolean;
    onClose: () => void;
    onInvite?: () => void;
    onMessage?: (
        conversationId: string,
        recruiterName: string,
        recruiterUserId: string,
    ) => void;
}

// Loading skeleton that matches the layout structure
function LoadingSkeleton() {
    return (
        <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 animate-pulse">
            {/* Header skeleton matching avatar + name + badges */}
            <div className="flex gap-5 items-start">
                <div className="skeleton w-20 h-20 rounded-full shrink-0"></div>
                <div className="space-y-2 flex-1">
                    <div className="flex gap-2 items-center">
                        <div className="skeleton h-7 w-48"></div>
                        <div className="skeleton h-5 w-16"></div>
                    </div>
                    <div className="skeleton h-5 w-3/4"></div>
                    <div className="flex gap-4 pt-1">
                        <div className="skeleton h-4 w-24"></div>
                        <div className="skeleton h-4 w-32"></div>
                    </div>
                </div>
            </div>

            {/* Bio section skeleton */}
            <div className="space-y-3">
                <div className="skeleton h-6 w-24"></div>
                <div className="skeleton h-32 w-full rounded-lg"></div>
            </div>

            {/* Stats skeleton */}
            <div className="space-y-3">
                <div className="skeleton h-6 w-40"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-20 rounded-lg"></div>
                    ))}
                </div>
            </div>

            {/* Sidebar sections skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="skeleton h-24 rounded-lg"></div>
                <div className="skeleton h-24 rounded-lg"></div>
            </div>
        </div>
    );
}

// Empty state when no recruiter is selected
function EmptyState() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-base-content/40">
            <div className="bg-base-200 p-6 rounded-full mb-4">
                <i className="fa-duotone fa-regular fa-user-magnifying-glass text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Select a Recruiter</h3>
            <p className="max-w-xs">
                Browse the marketplace to find recruiters for your hiring needs.
            </p>
        </div>
    );
}

export function RecruiterDetailPanel({
    recruiter,
    loading = false,
    onClose,
    onInvite,
    onMessage,
}: RecruiterDetailPanelProps) {
    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!recruiter) {
        return <EmptyState />;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Mobile Header with Back Button */}
            <div className="flex md:hidden items-center p-4 border-b border-base-300 bg-base-100">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm mr-3"
                    aria-label="Back to list"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                </button>
                <h3 className="text-lg font-semibold flex-1">
                    Recruiter Profile
                </h3>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Header Section */}
                    <RecruiterDetailHeader
                        recruiter={recruiter}
                        onInviteToCompany={onInvite}
                        onMessage={onMessage}
                    />

                    {/* Two-column layout for larger screens */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Main Content (2 cols) */}
                        <div className="xl:col-span-2 space-y-8">
                            <RecruiterDetailBio recruiter={recruiter} />
                            <RecruiterDetailStats recruiter={recruiter} />
                        </div>

                        {/* Sidebar Content (1 col) */}
                        <div className="space-y-4">
                            <RecruiterDetailExperience recruiter={recruiter} />
                            <RecruiterDetailSpecialties recruiter={recruiter} />
                            <RecruiterDetailIndustries recruiter={recruiter} />
                            <RecruiterDetailContact recruiter={recruiter} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
