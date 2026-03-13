"use client";

/**
 * User Profile Context
 *
 * Provides centralized access to user profile data and role information
 * throughout the authenticated portion of the application.
 *
 * Usage:
 *   const { profile, isAdmin, isRecruiter, isCompanyUser, isLoading } = useUserProfile();
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
    useMemo,
} from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
    getCurrentUserProfile,
    getCachedSubscription,
} from "@/lib/current-user-profile";
import {
    useRecruiterPermissions,
    type CompanyPermissionEntry,
} from "@/hooks/use-recruiter-permissions";
import type { RecruiterCompanyPermissions } from "@/app/portal/invitation/shared/types";
import {
    STARTER_ENTITLEMENTS,
    type PlanEntitlements,
    type BooleanEntitlement,
    type NumericEntitlement,
    type MarketplacePriority,
} from "@splits-network/shared-types";

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
    entitlements?: PlanEntitlements;
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
    /** Whether the user is a hiring manager (not full company admin) */
    isHiringManager: boolean;
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
    // Entitlement fields
    /** The user's resolved entitlements (from plan or STARTER defaults) */
    entitlements: PlanEntitlements;
    /** Check if a boolean entitlement is enabled */
    hasEntitlement: (key: BooleanEntitlement) => boolean;
    /** Get the numeric limit for an entitlement (-1 = unlimited) */
    getLimit: (key: NumericEntitlement) => number;
    /** Check if current usage is within the entitlement limit */
    isWithinLimit: (key: NumericEntitlement, current: number) => boolean;
    /** The user's marketplace priority level */
    marketplacePriority: MarketplacePriority;
    /** All company permissions for the recruiter */
    companyPermissions: CompanyPermissionEntry[];
    /** Whether permissions are loading */
    isPermissionsLoading: boolean;
    /** Check if recruiter has a specific permission for a company */
    hasPermissionForCompany: (
        companyId: string,
        permission: keyof RecruiterCompanyPermissions,
    ) => boolean;
    /** Get company IDs where recruiter has a specific permission */
    getCompanyIdsWithPermission: (
        permission: keyof RecruiterCompanyPermissions,
    ) => string[];
    /** Refresh permissions */
    refreshPermissions: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

interface UserProfileProviderProps {
    children: ReactNode;
    /** Server-fetched profile to pre-seed state, eliminating the client-side loading flash */
    initialProfile?: Record<string, any> | null;
}

export function UserProfileProvider({
    children,
    initialProfile,
}: UserProfileProviderProps) {
    const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const { signOut } = useClerk();
    const [profile, setProfile] = useState<UserProfile | null>(
        (initialProfile as UserProfile) ?? null,
    );
    const [isLoading, setIsLoading] = useState(!initialProfile);
    const [error, setError] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    // Granular recruiter permissions (replaces legacy manageableCompanyIds)

    const fetchProfile = useCallback(
        async (opts?: { silent?: boolean }) => {
            if (!isAuthLoaded) return;

            if (!isSignedIn) {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            try {
                // If we already have profile data (from server-side initialProfile or a
                // prior fetch) perform a silent background refresh — no loading spinner.
                if (!opts?.silent) {
                    setIsLoading(true);
                }
                setError(null);

                const token = await getToken();
                if (!token) {
                    setProfile(null);
                    setIsLoading(false);
                    return;
                }

                const profileData = await getCurrentUserProfile(getToken);
                setProfile(profileData as UserProfile | null);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                // Only surface errors when not silently refreshing
                if (!opts?.silent) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load profile",
                    );
                }
                if (!opts?.silent) setProfile(null);
            } finally {
                if (!opts?.silent) setIsLoading(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [isAuthLoaded, isSignedIn],
    );

    useEffect(() => {
        // If we have server-provided initialProfile, do a silent background refresh
        // so the user never sees a loading state on first render.
        fetchProfile({ silent: Boolean(initialProfile) });
    }, [fetchProfile]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSubscription = useCallback(async () => {
        // Only fetch for recruiters
        if (!profile?.recruiter_id) {
            setSubscription(null);
            setIsSubscriptionLoading(false);
            return;
        }

        try {
            setIsSubscriptionLoading(true);
            const subscriptionData = await getCachedSubscription(getToken);
            setSubscription(subscriptionData as Subscription | null);
        } catch (err) {
            console.error("Failed to fetch subscription:", err);
            setSubscription(null);
        } finally {
            setIsSubscriptionLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.recruiter_id]);

    // Load subscription when profile loads
    useEffect(() => {
        if (profile) {
            fetchSubscription();
        }
    }, [profile, fetchSubscription]);

    const {
        permissions: companyPermissions,
        isLoading: isPermissionsLoading,
        hasPermission: hasPermissionForCompany,
        getCompanyIdsWithPermission,
        refresh: refreshPermissions,
    } = useRecruiterPermissions(profile?.recruiter_id ?? null);


    // Derived role checks
    const roles = profile?.roles || [];
    const isAdmin = Boolean(
        profile?.is_platform_admin || roles.includes("platform_admin"),
    );
    const isRecruiter = Boolean(profile?.recruiter_id);
    const isCompanyUser = roles.some(
        (role) => role === "company_admin" || role === "hiring_manager",
    );
    const isHiringManager = roles.includes("hiring_manager") && !roles.includes("company_admin");
    const isCandidate = Boolean(profile?.candidate_id);

    // Subscription derived values
    const plan = subscription?.plan || null;
    const planTier: PlanTier = plan?.tier || "starter";
    const planName = plan?.name || "Starter";
    const isPaidPlan = planTier !== "starter" && (plan?.price_monthly ?? 0) > 0;
    const isSubscriptionActive =
        subscription?.status === "active" ||
        subscription?.status === "trialing";

    // Entitlement derived values
    const entitlements: PlanEntitlements = useMemo(
        () => ({
            ...STARTER_ENTITLEMENTS,
            ...(plan?.entitlements ?? {}),
        }),
        [plan],
    );

    const hasEntitlement = useCallback(
        (key: BooleanEntitlement): boolean => {
            if (isAdmin) return true;
            return Boolean(entitlements[key]);
        },
        [entitlements, isAdmin],
    );

    const getLimit = useCallback(
        (key: NumericEntitlement): number => {
            if (isAdmin) return -1;
            return entitlements[key] as number;
        },
        [entitlements, isAdmin],
    );

    const isWithinLimit = useCallback(
        (key: NumericEntitlement, current: number): boolean => {
            const limit = getLimit(key);
            return limit === -1 || current < limit;
        },
        [getLimit],
    );

    const marketplacePriority: MarketplacePriority =
        (entitlements.marketplace_priority as MarketplacePriority) || "standard";

    const hasRole = useCallback(
        (role: string) => {
            if (isAdmin) return true; // Admins have all roles
            return roles.includes(role);
        },
        [roles, isAdmin],
    );

    const hasAnyRole = useCallback(
        (checkRoles: string[]) => {
            if (isAdmin) return true; // Admins have all roles
            if (checkRoles.includes("all")) return true;
            return checkRoles.some((role) => roles.includes(role));
        },
        [roles, isAdmin],
    );

    const logout = useCallback(async () => {
        // Clear all caches
        // REMOVED: clearUserCache() - user-cache.ts has been deleted
        // The chat API now includes participant names inline, eliminating the need for client-side user caching

        // Clear localStorage (preserve theme preference)
        const theme = localStorage.getItem("theme");
        localStorage.clear();
        if (theme) {
            localStorage.setItem("theme", theme);
        }

        // Clear sessionStorage
        sessionStorage.clear();

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
        isHiringManager,
        isCandidate,
        hasRole,
        hasAnyRole,
        refresh: () => fetchProfile(),
        logout,
        // Subscription fields
        subscription,
        plan,
        planTier,
        planName,
        isPaidPlan,
        isSubscriptionActive,
        isSubscriptionLoading,
        refreshSubscription: () => fetchSubscription(),
        // Entitlement fields
        entitlements,
        hasEntitlement,
        getLimit,
        isWithinLimit,
        marketplacePriority,
        companyPermissions,
        isPermissionsLoading,
        hasPermissionForCompany,
        getCompanyIdsWithPermission,
        refreshPermissions,
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
        throw new Error(
            "useUserProfile must be used within a UserProfileProvider",
        );
    }

    return context;
}
