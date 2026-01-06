'use client';

import { useUserProfile } from '@/contexts';
import RecruiterDashboard from './recruiter-dashboard';
import CompanyDashboard from './company-dashboard';
import AdminDashboard from './admin-dashboard';

export default function DashboardClient() {
    const { profile, isLoading, error, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="alert alert-error max-w-md">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error || 'Failed to load dashboard. Please try again.'}</span>
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
        return <RecruiterDashboard />;
    }

    // Default: Show onboarding or empty state
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="card bg-base-100 shadow max-w-md">
                <div className="card-body text-center">
                    <i className="fa-solid fa-user-circle text-6xl text-primary mb-4"></i>
                    <h2 className="card-title justify-center">Welcome to Splits Network!</h2>
                    <p className="text-base-content/70">
                        Your account is being set up. Please complete your profile to get started.
                    </p>
                    <div className="card-actions justify-center mt-4">
                        <a href="/profile" className="btn btn-primary">
                            Complete Profile
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
