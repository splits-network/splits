"use client";

import { useUserProfile } from "@/contexts";
import RecruiterDashboard from "./recruiter-dashboard";
import CompanyDashboard from "./company-dashboard";
import AdminDashboard from "./admin-dashboard";
import { PageTitle } from "@/components/page-title";

export default function DashboardClient() {
    const { profile, isLoading, error, isAdmin, isRecruiter, isCompanyUser } =
        useUserProfile();

    if (isLoading || !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
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

    // Route to appropriate dashboard based on role
    if (isAdmin) {
        return <AdminDashboard />;
    }

    if (isCompanyUser) {
        return <CompanyDashboard />;
    }

    if (isRecruiter) {
        return (
            <>
                <PageTitle
                    title={`Welcome back, ${profile.name}!`}
                    subtitle="Here's an overview of your recruiting activity."
                />
                <RecruiterDashboard />
            </>
        );
    }

    // Default: Show loading state while account is being set up
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-base-content/70">
                Setting up your dashboard...
            </p>
        </div>
    );
}
