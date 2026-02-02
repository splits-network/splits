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
import { useAuth, useClerk } from '@clerk/nextjs';
import { getCachedCurrentUserProfile, getCachedSubscription, clearCachedCurrentUserProfile } from '@/lib/current-user-profile';

/**
 * Plan tier types
 */
export type PlanTier = "starter" | "pro" | "partner";

/**
 * Subscription status types
 */
export type SubscriptionStatus =
    | "active"
    | "past_due"
    | "canceled"
    | "trialing"
    | "incomplete";

/**
 * Billing period types
 */
export type BillingPeriod = "monthly" | "annual";

/**
 * Plan data structure
 */
export interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: PlanTier;
    description: string | null;
    price_monthly: number;
    price_annual: number;
    currency: string;
    features: Record<string, any>;
    is_active: boolean;
}

/**
 * Subscription data structure
 */
export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    status: SubscriptionStatus;
    billing_period?: BillingPeriod;
    current_period_start: string;
    current_period_end: string | null;
    trial_start: string | null;
    trial_end: string | null;
    cancel_at: string | null;
    canceled_at: string | null;
    created_at: string;
    updated_at: string;
    plan?: Plan;
}

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
    /** Logout the user and clean up all caches */
    logout: () => Promise<void>;
    // Subscription fields
    /** The user's subscription data, null if not loaded or no subscription */
    subscription: Subscription | null;
    /** The user's current plan, null if not loaded */
    plan: Plan | null;
    /** The plan tier (starter, pro, partner), defaults to 'starter' */
    planTier: PlanTier;
    /** The plan display name */
    planName: string;
    /** Whether the user has an active paid subscription */
    isPaidPlan: boolean;
    /** Whether the subscription is active */
    isSubscriptionActive: boolean;
    /** Whether the subscription is currently being loaded */
    isSubscriptionLoading: boolean;
    /** Refresh the subscription data */
    refreshSubscription: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

interface UserProfileProviderProps {
    children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
    const { getToken, isLoaded: isAuthLoaded } = useAuth();
    const { signOut } = useClerk();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

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

    const fetchSubscription = useCallback(async (force = false) => {
        // Only fetch for recruiters
        if (!profile?.recruiter_id) {
            setSubscription(null);
            setIsSubscriptionLoading(false);
            return;
        }

        try {
            setIsSubscriptionLoading(true);
            const subscriptionData = await getCachedSubscription(getToken, { force });
            setSubscription(subscriptionData as Subscription | null);
        } catch (err) {
            console.error('Failed to fetch subscription:', err);
            setSubscription(null);
        } finally {
            setIsSubscriptionLoading(false);
        }
    }, [profile?.recruiter_id, getToken]);

    // Load subscription when profile loads
    useEffect(() => {
        if (profile) {
            fetchSubscription();
        }
    }, [profile, fetchSubscription]);

    // Derived role checks
    const roles = profile?.roles || [];
    const isAdmin = Boolean(profile?.is_platform_admin || roles.includes('platform_admin'));
    const isRecruiter = Boolean(profile?.recruiter_id);
    const isCompanyUser = roles.some(role => role === 'company_admin' || role === 'hiring_manager');
    const isCandidate = Boolean(profile?.candidate_id);

    // Subscription derived values
    const plan = subscription?.plan || null;
    const planTier: PlanTier = plan?.tier || 'starter';
    const planName = plan?.name || 'Starter';
    const isPaidPlan = planTier !== 'starter' && (plan?.price_monthly ?? 0) > 0;
    const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trialing';

    const hasRole = useCallback((role: string) => {
        if (isAdmin) return true; // Admins have all roles
        return roles.includes(role);
    }, [roles, isAdmin]);

    const hasAnyRole = useCallback((checkRoles: string[]) => {
        if (isAdmin) return true; // Admins have all roles
        if (checkRoles.includes('all')) return true;
        return checkRoles.some(role => roles.includes(role));
    }, [roles, isAdmin]);

    const logout = useCallback(async () => {
        // Clear all caches
        clearCachedCurrentUserProfile();
        // REMOVED: clearUserCache() - user-cache.ts has been deleted
        // The chat API now includes participant names inline, eliminating the need for client-side user caching

        // Clear localStorage (preserve theme preference)
        const theme = localStorage.getItem('theme');
        localStorage.clear();
        if (theme) {
            localStorage.setItem('theme', theme);
        }

        // Clear sessionStorage
        sessionStorage.clear();

        console.log('[Auth] User session cleaned');

        // Sign out from Clerk
        await signOut();
    }, [signOut]);

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
        logout,
        // Subscription fields
        subscription,
        plan,
        planTier,
        planName,
        isPaidPlan,
        isSubscriptionActive,
        isSubscriptionLoading,
        refreshSubscription: () => fetchSubscription(true),
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
