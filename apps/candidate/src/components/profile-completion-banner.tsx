"use client";

/**
 * Profile Completion Banner
 * Shows a banner for users who skipped onboarding, encouraging them to complete their profile
 */

import { useState, useEffect } from "react";
import { useOnboarding } from "./onboarding";

interface ProfileCompletionBannerProps {
    className?: string;
}

export function ProfileCompletionBanner({
    className = "",
}: ProfileCompletionBannerProps) {
    const { state, openModal } = useOnboarding();
    const [isDismissed, setIsDismissed] = useState(false);

    // Check localStorage for dismissal on mount
    useEffect(() => {
        const dismissed = sessionStorage.getItem("profile-banner-dismissed");
        if (dismissed === "true") {
            setIsDismissed(true);
        }
    }, []);

    // Only show if onboarding was skipped and not dismissed
    if (state.status !== "skipped" || isDismissed) {
        return null;
    }

    // Calculate completion percentage based on filled fields
    const calculateCompletion = () => {
        const fields = [
            state.profileData.full_name,
            state.profileData.phone,
            state.profileData.location,
            state.profileData.resumeUploaded,
            state.profileData.desired_job_type?.length,
            state.profileData.open_to_remote !== undefined,
            state.profileData.desired_salary_min !== undefined ||
                state.profileData.desired_salary_max !== undefined,
        ];

        const filledCount = fields.filter(Boolean).length;
        return Math.round((filledCount / fields.length) * 100);
    };

    const completionPercentage = calculateCompletion();

    const handleDismiss = () => {
        sessionStorage.setItem("profile-banner-dismissed", "true");
        setIsDismissed(true);
    };

    const handleResumeSetup = () => {
        openModal();
    };

    return (
        <div
            className={`alert alert-info shadow-sm flex flex-col gap-4 sm:alert-horizontal sm:flex-row sm:items-center ${className}`}
        >
            <div className="flex items-start gap-3 flex-1 sm:items-center">
                <i className="fa-duotone fa-regular fa-user-pen text-2xl"></i>
                <div className="flex-1">
                    <h3 className="font-semibold">Complete Your Profile</h3>
                    <p className="text-sm opacity-90">
                        Your profile is {completionPercentage}% complete. A
                        complete profile helps recruiters find and match you
                        with better opportunities.
                    </p>
                </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button
                    className="btn btn-sm btn-ghost w-full sm:w-auto"
                    onClick={handleDismiss}
                >
                    Dismiss
                </button>
                <button
                    className="btn btn-sm btn-primary w-full sm:w-auto"
                    onClick={handleResumeSetup}
                >
                    <i className="fa-duotone fa-regular fa-arrow-right mr-1"></i>
                    Resume Setup
                </button>
            </div>
        </div>
    );
}
