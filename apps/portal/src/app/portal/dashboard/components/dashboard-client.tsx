"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserProfile } from "@/contexts";
import RecruiterDashboard from "./recruiter-dashboard";
import CompanyDashboard from "./company-dashboard";
import AdminDashboard from "./admin-dashboard";
import { PageTitle } from "@/components/page-title";
import { TrendPeriodSelector } from "@/components/charts/trend-period-selector";

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

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [trendPeriod, setTrendPeriod] = useState(6);

    if (isRecruiter) {
        return (
            <>
                <PageTitle
                    title={`Welcome back, ${profile.name}!`}
                    subtitle="Here's an overview of your recruiting activity."
                >
                    <TrendPeriodSelector
                        trendPeriod={trendPeriod}
                        onTrendPeriodChange={setTrendPeriod}
                    />
                    <div className="hidden lg:block w-px h-6 bg-base-300" />
                    <Link href="/portal/roles" className="btn btn-primary btn-sm gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase w-3.5"></i>
                        Browse Roles
                    </Link>
                    <Link href="/portal/candidates" className="btn btn-ghost btn-sm gap-2">
                        <i className="fa-duotone fa-regular fa-users w-3.5"></i>
                        Candidates
                    </Link>
                    <Link href="/portal/applications" className="btn btn-ghost btn-sm gap-2">
                        <i className="fa-duotone fa-regular fa-inbox w-3.5"></i>
                        Applications
                    </Link>
                    <Link href="/portal/placements" className="btn btn-ghost btn-sm gap-2">
                        <i className="fa-duotone fa-regular fa-trophy w-3.5"></i>
                        Placements
                    </Link>
                </PageTitle>
                <RecruiterDashboard
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
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
