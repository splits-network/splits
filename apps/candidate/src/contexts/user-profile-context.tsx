"use client";

/**
 * User Profile Context (Candidate App)
 *
 * Provides centralized access to user profile data throughout the
 * authenticated candidate portal. Accepts server-fetched `initialProfile`
 * to pre-seed state and eliminate the client-side loading flash.
 *
 * Usage:
 *   const { profile, isCandidate, isAdmin, isLoading } = useUserProfile();
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { getCachedCurrentUserProfile } from "@/lib/current-user-profile";

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
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isAdmin: boolean;
    isCandidate: boolean;
    isRecruiter: boolean;
    refresh: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

interface UserProfileProviderProps {
    children: ReactNode;
    /** Server-fetched profile to pre-seed state, eliminating the loading flash */
    initialProfile?: Record<string, any> | null;
}

export function UserProfileProvider({
    children,
    initialProfile,
}: UserProfileProviderProps) {
    const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(
        (initialProfile as UserProfile) ?? null,
    );
    const [isLoading, setIsLoading] = useState(!initialProfile);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!isAuthLoaded) return;

        if (!isSignedIn) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const profileData = await getCachedCurrentUserProfile(getToken, {
                force: true,
            });
            setProfile(profileData as UserProfile | null);
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load profile",
            );
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoaded, isSignedIn]);

    // Only run the client-side fetch if we didn't get server-side initial data.
    // If we have initialProfile, background-refresh after mount to keep it fresh.
    useEffect(() => {
        if (!initialProfile) {
            fetchProfile();
        } else if (isAuthLoaded && isSignedIn) {
            // Silently refresh in the background without triggering isLoading
            getCachedCurrentUserProfile(getToken, { force: true })
                .then((data) => {
                    if (data) setProfile(data as UserProfile);
                })
                .catch(() => {
                    // Ignore background refresh errors — we already have initialProfile
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoaded, isSignedIn]);

    const isAdmin = Boolean(
        profile?.is_platform_admin ||
        profile?.roles?.includes("platform_admin"),
    );
    const isCandidate = Boolean(profile?.candidate_id);
    const isRecruiter = Boolean(profile?.recruiter_id);

    const value: UserProfileContextValue = {
        profile,
        isLoading,
        error,
        isAdmin,
        isCandidate,
        isRecruiter,
        refresh: () => fetchProfile(),
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile(): UserProfileContextValue {
    const context = useContext(UserProfileContext);

    if (!context) {
        throw new Error(
            "useUserProfile must be used within a UserProfileProvider",
        );
    }

    return context;
}
