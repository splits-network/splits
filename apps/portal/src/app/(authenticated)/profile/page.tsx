'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { UserProfileSettings } from './components/user-profile-settings';
import { ProfileSettings } from './components/profile-settings';
import { MarketplaceSettings } from './components/marketplace-settings';

export default function SettingsPage() {
    const router = useRouter();
    const { getToken, isLoaded } = useAuth();
    const [isRecruiter, setIsRecruiter] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkUserRole() {
            if (!isLoaded) return;

            try {
                const token = await getToken();
                if (!token) {
                    setLoading(false);
                    return;
                }

                const apiClient = createAuthenticatedClient(token);
                const profile: any = await apiClient.get('/me');
                const memberships = profile.data?.memberships || [];

                const hasRecruiterRole = memberships.some(
                    (m: any) => m.role === 'recruiter'
                );

                setIsRecruiter(hasRecruiterRole);
                setLoading(false);
            } catch (error) {
                console.error('Failed to check user role:', error);
                setLoading(false);
            }
        }

        checkUserRole();
    }, [isLoaded, getToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            <div className="space-y-4">
                {/* Profile & Account Card */}
                <UserProfileSettings />

                {/* Recruiter Profile (Recruiters Only) */}
                {isRecruiter && <ProfileSettings />}

                {/* Marketplace Settings (Recruiters Only) */}
                {isRecruiter && <MarketplaceSettings />}

                {/* Notifications Card (Future) */}
                <div className="card bg-base-100 shadow-sm opacity-60">
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

                {/* Integrations Card (Future) */}
                <div className="card bg-base-100 shadow-sm opacity-60">
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
            </div>
        </div>
    );
}
