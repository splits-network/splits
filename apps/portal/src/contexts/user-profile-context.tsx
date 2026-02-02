'use client';

/**
 * User Profile Context
 * 
 * Provides centralized access to user profile data and role information
 * throughout the authenticated portion of the application.
 * 
 * Usage:
 *   const { profile, isAdmin, isRecruiter, isCompanyUser, isLoading } = useUserProfile();
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getCachedCurrentUserProfile } from '@/lib/current-user-profile';

/**
 * User profile data returned from /api/v2/users/me
 */
export interface UserProfile {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string | null;
    profile_image_url?: string | null;
    onboarding_status: string;
    created_at: string;
    updated_at: string;
    // Access control fields
    roles: string[];
    is_platform_admin: boolean;
    recruiter_id: string | null;
    candidate_id: string | null;
    organization_ids: string[];
}

interface UserProfileContextValue {
    /** The user's profile data, null if not loaded or error */
    profile: UserProfile | null;
    /** Whether the profile is currently being loaded */
    isLoading: boolean;
    /** Error message if profile fetch failed */
    error: string | null;
    /** Whether the user is a platform admin */
    isAdmin: boolean;
    /** Whether the user is a recruiter (has recruiter_id) */
    isRecruiter: boolean;
    /** Whether the user is a company user (company_admin or hiring_manager) */
    isCompanyUser: boolean;
    /** Whether the user is a candidate (has candidate_id) */
    isCandidate: boolean;
    /** Check if user has a specific role */
    hasRole: (role: string) => boolean;
    /** Check if user has any of the specified roles */
    hasAnyRole: (roles: string[]) => boolean;
    /** Refresh the profile data */
    refresh: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

interface UserProfileProviderProps {
    children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
    const { getToken, isLoaded: isAuthLoaded } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (force = false) => {
        if (!isAuthLoaded) return;

        try {
            setIsLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            const profileData = await getCachedCurrentUserProfile(getToken, {
                force,
            });
            setProfile(profileData as UserProfile | null);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to load profile');
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthLoaded, getToken]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Derived role checks
    const roles = profile?.roles || [];
    const isAdmin = Boolean(profile?.is_platform_admin || roles.includes('platform_admin'));
    const isRecruiter = Boolean(profile?.recruiter_id);
    const isCompanyUser = roles.some(role => role === 'company_admin' || role === 'hiring_manager');
    const isCandidate = Boolean(profile?.candidate_id);

    const hasRole = useCallback((role: string) => {
        if (isAdmin) return true; // Admins have all roles
        return roles.includes(role);
    }, [roles, isAdmin]);

    const hasAnyRole = useCallback((checkRoles: string[]) => {
        if (isAdmin) return true; // Admins have all roles
        if (checkRoles.includes('all')) return true;
        return checkRoles.some(role => roles.includes(role));
    }, [roles, isAdmin]);

    const value: UserProfileContextValue = {
        profile,
        isLoading,
        error,
        isAdmin,
        isRecruiter,
        isCompanyUser,
        isCandidate,
        hasRole,
        hasAnyRole,
        refresh: () => fetchProfile(true),
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

/**
 * Hook to access user profile and role information
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *     const { profile, isAdmin, isRecruiter, isLoading } = useUserProfile();
 *     
 *     if (isLoading) return <Loading />;
 *     if (!profile) return <NotAuthenticated />;
 *     
 *     return (
 *         <div>
 *             <p>Hello, {profile.name || profile.email}</p>
 *             {isAdmin && <AdminPanel />}
 *             {isRecruiter && <RecruiterDashboard />}
 *         </div>
 *     );
 * }
 * ```
 */
export function useUserProfile(): UserProfileContextValue {
    const context = useContext(UserProfileContext);

    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }

    return context;
}
