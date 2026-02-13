'use client';

import { useAuth } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts/user-profile-context';
import { ActivityTracker } from '@splits-network/shared-ui';

function deriveUserType(profile: any): string | undefined {
    if (!profile) return undefined;
    if (profile.is_platform_admin) return 'company_admin';
    if (profile.recruiter_id) return 'recruiter';
    if (profile.roles?.includes('hiring_manager')) return 'hiring_manager';
    if (profile.roles?.includes('company_admin')) return 'company_admin';
    if (profile.candidate_id) return 'candidate';
    return undefined;
}

export function PortalActivityTrackerWrapper() {
    const { userId } = useAuth();
    const { profile } = useUserProfile();
    const userType = deriveUserType(profile);

    return <ActivityTracker app="portal" userId={userId || undefined} userType={userType} />;
}
