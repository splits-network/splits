"use client";

/**
 * Profile Completion Banner
 * Shows a banner for users who skipped onboarding, encouraging them to complete their profile.
 * Navigates to /onboarding instead of opening the old modal.
 */

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts";

interface ProfileCompletionBannerProps {
    className?: string;
}

export function ProfileCompletionBanner({
    className = "",
}: ProfileCompletionBannerProps) {
    const { profile } = useUserProfile();
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem("profile-banner-dismissed");
        if (dismissed === "true") {
            setIsDismissed(true);
        }
    }, []);

    // Only show if onboarding was skipped and not dismissed
    if (profile?.onboarding_status !== "skipped" || isDismissed) {
        return null;
    }

    const handleDismiss = () => {
        sessionStorage.setItem("profile-banner-dismissed", "true");
        setIsDismissed(true);
    };

    const handleResumeSetup = () => {
        window.location.href = "/onboarding";
    };

    return (
        <div
            className={`alert alert-info shadow-sm flex flex-col gap-4 sm:alert-horizontal sm:flex-row sm:items-center ${className}`}
        >
            <div className="flex items-start gap-3 flex-1 sm:items-center">
                <i className="fa-duotone fa-regular fa-user-pen text-2xl" />
                <div className="flex-1">
                    <h3 className="font-semibold">Complete Your Profile</h3>
                    <p className="text-sm opacity-90">
                        A complete profile helps recruiters find and match you
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
                    <i className="fa-duotone fa-regular fa-arrow-right mr-1" />
                    Resume Setup
                </button>
            </div>
        </div>
    );
}
