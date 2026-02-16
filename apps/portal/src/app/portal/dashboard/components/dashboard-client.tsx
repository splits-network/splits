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
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="border-4 border-dark bg-cream p-12 text-center">
                    <div className="w-12 h-12 border-4 border-coral mx-auto mb-4 animate-spin" />
                    <p className="font-black text-dark uppercase tracking-wider text-sm">
                        Loading Dashboard
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center p-4">
                <div className="border-4 border-coral bg-cream p-8 max-w-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-coral flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-cream"></i>
                        </div>
                        <h2 className="font-black text-dark uppercase tracking-wide">
                            Error
                        </h2>
                    </div>
                    <p className="text-dark/70 text-sm">
                        {error || "Failed to load dashboard. Please try again."}
                    </p>
                </div>
            </div>
        );
    }

    if (isAdmin) return <AdminDashboard />;
    if (isCompanyUser) return <CompanyDashboard />;
    if (isRecruiter) return <RecruiterDashboard />;

    return <LoadingState message="Setting up your dashboard..." />;
}