'use client';

import { UserProfileSettings } from './components/user-profile-settings';
import { ProfileSettings } from './components/profile-settings';
import { MarketplaceSettings } from '@/components/settings/marketplace-settings';
import { useUserProfile } from '@/contexts';

export default function SettingsPage() {
    const { profile, isLoading, isAdmin, isRecruiter, isCompanyUser, hasRole } = useUserProfile();

    // Derive specific role checks
    const isCompanyAdmin = hasRole('company_admin');
    const isHiringManager = hasRole('hiring_manager');
    const isPlatformAdmin = isAdmin;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            <div className="space-y-4">
                {/* Profile & Account Card - Available to ALL users */}
                <UserProfileSettings />

                {/* Recruiter Profile (Recruiters Only) */}
                {isRecruiter && <ProfileSettings />}

                {/* Marketplace Settings (Recruiters Only) */}
                {isRecruiter && <MarketplaceSettings />}

                {/* Company Settings - Future (Company Admins & Hiring Managers) */}
                {(isCompanyAdmin || isHiringManager) && (
                    <div className="card bg-base-100 shadow opacity-60">
                        <div className="card-body">
                            <h2 className="card-title">
                                <i className="fa-solid fa-building"></i>
                                Company Settings
                                <div className="badge badge-sm">Coming Soon</div>
                            </h2>
                            <p className="text-sm text-base-content/70">
                                Manage company profile, branding, and hiring preferences
                            </p>
                        </div>
                    </div>
                )}

                {/* Platform Administration (Platform Admins Only) */}
                {isPlatformAdmin && (
                    <div className="card bg-base-100 shadow opacity-60">
                        <div className="card-body">
                            <h2 className="card-title">
                                <i className="fa-solid fa-shield-halved"></i>
                                Platform Administration
                                <div className="badge badge-sm">Coming Soon</div>
                            </h2>
                            <p className="text-sm text-base-content/70">
                                Platform-wide settings, user management, and analytics
                            </p>
                        </div>
                    </div>
                )}

                {/* Notifications Card (Future - All users) */}
                <div className="card bg-base-100 shadow opacity-60">
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-solid fa-bell"></i>
                            Notifications
                            <div className="badge badge-sm">Coming Soon</div>
                        </h2>
                        <p className="text-sm text-base-content/70">
                            Configure email and in-app notification preferences
                        </p>
                    </div>
                </div>

                {/* Integrations Card (Future - Available based on role) */}
                {(isRecruiter || isCompanyAdmin || isPlatformAdmin) && (
                    <div className="card bg-base-100 shadow opacity-60">
                        <div className="card-body">
                            <h2 className="card-title">
                                <i className="fa-solid fa-plug"></i>
                                Integrations
                                <div className="badge badge-sm">Coming Soon</div>
                            </h2>
                            <p className="text-sm text-base-content/70">
                                Connect to external services and ATS platforms
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
