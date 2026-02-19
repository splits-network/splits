"use client";

import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import AdminView from "@/components/basel/dashboard/views/admin-view";
import RecruiterView from "@/components/basel/dashboard/views/recruiter-view";
import CompanyView from "@/components/basel/dashboard/views/company-view";

export default function DashboardClient() {
    const { profile, isLoading, error, isAdmin, isRecruiter, isCompanyUser } =
        useUserProfile();

    if (isLoading || !profile) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <LoadingState message="Loading dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
                <div className="bg-base-200 border-t-4 border-error p-8 max-w-md text-center">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-2xl mb-3" />
                    <p className="text-sm font-semibold text-base-content/70">
                        {error || "Failed to load dashboard. Please try again."}
                    </p>
                </div>
            </div>
        );
    }

    if (isAdmin) return <AdminView />;
    if (isCompanyUser) return <CompanyView />;
    if (isRecruiter) return <RecruiterView />;

    return <LoadingState message="Setting up your dashboard..." />;
}
