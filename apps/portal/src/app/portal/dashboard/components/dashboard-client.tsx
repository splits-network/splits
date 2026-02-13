"use client";

import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import RecruiterDashboard from "./recruiter-dashboard";
import CompanyDashboard from "./company-dashboard";
import AdminDashboard from "./admin-dashboard";

export default function DashboardClient() {
    const { profile, isLoading, error, isAdmin, isRecruiter, isCompanyUser } =
        useUserProfile();

    if (isLoading || !profile) {
        return <LoadingState message="Loading dashboard..." />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="alert alert-error max-w-md">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>
                        {error || "Failed to load dashboard. Please try again."}
                    </span>
                </div>
            </div>
        );
    }

    if (isAdmin) return <AdminDashboard />;
    if (isCompanyUser) return <CompanyDashboard />;
    if (isRecruiter) return <RecruiterDashboard />;

    return <LoadingState message="Setting up your dashboard..." />;
}
