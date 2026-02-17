"use client";

import { UserProfileSettings } from "./components/user-profile-settings";
import { MarketplaceSettings } from "./components/marketplace-settings";
import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import { ColorBar, MemphisTriangle, MemphisPlus } from "@splits-network/memphis-ui";

export default function ProfileMemphisPage() {
    const { profile, isLoading, isAdmin, isRecruiter, isCompanyUser, hasRole } =
        useUserProfile();

    // Derive specific role checks
    const isCompanyAdmin = hasRole("company_admin");
    const isHiringManager = hasRole("hiring_manager");
    const isPlatformAdmin = isAdmin;

    if (isLoading) {
        return <LoadingState message="Loading profile..." />;
    }

    return (
        <div className="min-h-screen bg-cream">
            {/* Memphis color bar */}
            <ColorBar />

            {/* Page Header */}
            <div className="bg-dark border-b-4 border-dark relative overflow-hidden">
                {/* Geometric decorations */}
                <MemphisTriangle
                    color="coral"
                    size="lg"
                    className="absolute top-4 right-20 opacity-20"
                />
                <MemphisPlus
                    color="yellow"
                    size="md"
                    className="absolute bottom-6 right-60 opacity-15"
                />

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                        <i className="fa-duotone fa-regular fa-user"></i>Profile
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                        Your{" "}
                        <span className="text-teal">Settings</span>
                    </h1>
                    <p className="text-sm mt-2 text-cream/60 font-bold">
                        Manage your account and marketplace profile
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Primary Settings */}
                        <div className="flex-1 space-y-8">
                            {/* Marketplace Settings (Recruiters Only) */}
                            {isRecruiter && <MarketplaceSettings />}

                            {/* Platform Administration (Platform Admins Only) */}
                            {isPlatformAdmin && (
                                <div className="border-4 border-dark bg-white p-8 opacity-60 relative">
                                    <MemphisTriangle
                                        color="purple"
                                        size="sm"
                                        className="absolute top-4 right-4 opacity-30"
                                    />
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-purple">
                                            <i className="fa-duotone fa-regular fa-shield-halved text-white"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-2 text-dark">
                                                Platform Administration
                                                <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-yellow text-dark">
                                                    Coming Soon
                                                </span>
                                            </h2>
                                            <p className="text-sm text-dark/70">
                                                Platform-wide settings, user management,
                                                and analytics
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Card (Future - All users) */}
                            <div className="border-4 border-dark bg-white p-8 opacity-60 relative">
                                <MemphisPlus
                                    color="teal"
                                    size="sm"
                                    className="absolute top-4 right-4 opacity-30"
                                />
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-teal">
                                        <i className="fa-duotone fa-regular fa-bell text-dark"></i>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-2 text-dark">
                                            Notifications
                                            <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-yellow text-dark">
                                                Coming Soon
                                            </span>
                                        </h2>
                                        <p className="text-sm text-dark/70">
                                            Configure email and in-app notification
                                            preferences
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Integrations Card (Future - Available based on role) */}
                            {(isRecruiter || isCompanyAdmin || isPlatformAdmin) && (
                                <div className="border-4 border-dark bg-white p-8 opacity-60 relative">
                                    <MemphisTriangle
                                        color="coral"
                                        size="sm"
                                        className="absolute top-4 right-4 opacity-30"
                                    />
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-coral">
                                            <i className="fa-duotone fa-regular fa-plug text-white"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-2 text-dark">
                                                Integrations
                                                <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-yellow text-dark">
                                                    Coming Soon
                                                </span>
                                            </h2>
                                            <p className="text-sm text-dark/70">
                                                Connect to external services and ATS
                                                platforms
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Profile & Security */}
                        <div className="lg:w-96 space-y-8">
                            <UserProfileSettings />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
