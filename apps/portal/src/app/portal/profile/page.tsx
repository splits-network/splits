"use client";

import { UserProfileSettings } from "./components/user-profile-settings";
import { MarketplaceSettings } from "./components/marketplace-settings";
import { useUserProfile } from "@/contexts";
import { PageTitle } from "@/components/page-title";

export default function SettingsPage() {
    const { profile, isLoading, isAdmin, isRecruiter, isCompanyUser, hasRole } =
        useUserProfile();

    // Derive specific role checks
    const isCompanyAdmin = hasRole("company_admin");
    const isHiringManager = hasRole("hiring_manager");
    const isPlatformAdmin = isAdmin;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <>
            <PageTitle
                title="Profile"
                subtitle="Manage your account settings"
            />
            <div className="p-6">
                <div className="flex space-y-4 gap-4">
                    <div className="basis-2/3 space-y-4">
                        {/* Marketplace Settings (Recruiters Only) */}
                        {isRecruiter && <MarketplaceSettings />}

                        {/* Platform Administration (Platform Admins Only) */}
                        {isPlatformAdmin && (
                            <div className="card bg-base-100 shadow opacity-60">
                                <div className="card-body">
                                    <h2 className="card-title">
                                        <i className="fa-duotone fa-regular fa-shield-halved"></i>
                                        Platform Administration
                                        <div className="badge badge-sm">
                                            Coming Soon
                                        </div>
                                    </h2>
                                    <p className="text-sm text-base-content/70">
                                        Platform-wide settings, user management,
                                        and analytics
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Notifications Card (Future - All users) */}
                        <div className="card bg-base-100 shadow opacity-60">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <i className="fa-duotone fa-regular fa-bell"></i>
                                    Notifications
                                    <div className="badge badge-sm">
                                        Coming Soon
                                    </div>
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    Configure email and in-app notification
                                    preferences
                                </p>
                            </div>
                        </div>

                        {/* Integrations Card (Future - Available based on role) */}
                        {(isRecruiter || isCompanyAdmin || isPlatformAdmin) && (
                            <div className="card bg-base-100 shadow opacity-60">
                                <div className="card-body">
                                    <h2 className="card-title">
                                        <i className="fa-duotone fa-regular fa-plug"></i>
                                        Integrations
                                        <div className="badge badge-sm">
                                            Coming Soon
                                        </div>
                                    </h2>
                                    <p className="text-sm text-base-content/70">
                                        Connect to external services and ATS
                                        platforms
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="basis-1/3 space-y-4">
                        {/* Profile & Account Card - Available to ALL users */}
                        <UserProfileSettings />
                    </div>
                </div>
            </div>
        </>
    );
}
