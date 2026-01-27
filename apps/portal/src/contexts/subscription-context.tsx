"use client";

/**
 * Subscription Context
 *
 * Provides centralized access to subscription and plan data
 * throughout the authenticated portion of the application.
 *
 * Usage:
 *   const { subscription, plan, isLoading, planTier } = useSubscription();
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "./user-profile-context";

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

interface SubscriptionContextValue {
    /** The user's subscription data, null if not loaded or no subscription */
    subscription: Subscription | null;
    /** The user's current plan, null if not loaded */
    plan: Plan | null;
    /** The plan tier (starter, pro, partner), defaults to 'starter' */
    planTier: PlanTier;
    /** The plan display name */
    planName: string;
    /** Whether the subscription is currently being loaded */
    isLoading: boolean;
    /** Error message if subscription fetch failed */
    error: string | null;
    /** Whether the user has an active paid subscription */
    isPaidPlan: boolean;
    /** Whether the subscription is active */
    isActive: boolean;
    /** Refresh the subscription data */
    refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
    null,
);

interface SubscriptionProviderProps {
    children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
    const { getToken, isLoaded: isAuthLoaded } = useAuth();
    const { isRecruiter, isLoading: isProfileLoading } = useUserProfile();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
        // Only fetch subscriptions for recruiters
        if (!isAuthLoaded || isProfileLoading) return;

        // Non-recruiters don't have subscriptions
        if (!isRecruiter) {
            setSubscription(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                setSubscription(null);
                setIsLoading(false);
                return;
            }

            const apiClient = createAuthenticatedClient(token);
            const response: any = await apiClient.get("/subscriptions/me");
            const subscriptionData = response?.data || null;

            setSubscription(subscriptionData);
        } catch (err: any) {
            // 404 or "No subscription" is expected for new users
            if (
                err?.response?.status === 404 ||
                err?.message?.includes("No subscription")
            ) {
                setSubscription(null);
                setError(null);
            } else {
                console.error("Failed to fetch subscription:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load subscription",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthLoaded, isProfileLoading, isRecruiter, getToken]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    // Derived values
    const plan = subscription?.plan || null;
    const planTier: PlanTier = plan?.tier || "starter";
    const planName = plan?.name || "Starter";
    const isPaidPlan =
        planTier !== "starter" &&
        plan?.price_monthly !== undefined &&
        plan.price_monthly > 0;
    const isActive =
        subscription?.status === "active" ||
        subscription?.status === "trialing";

    const value: SubscriptionContextValue = {
        subscription,
        plan,
        planTier,
        planName,
        isLoading,
        error,
        isPaidPlan,
        isActive,
        refresh: fetchSubscription,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

/**
 * Hook to access subscription and plan information
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *     const { plan, planTier, isPaidPlan, isLoading } = useSubscription();
 *
 *     if (isLoading) return <Loading />;
 *
 *     return (
 *         <div>
 *             <p>Current plan: {plan?.name || 'Starter'}</p>
 *             {isPaidPlan && <PremiumFeatures />}
 *         </div>
 *     );
 * }
 * ```
 */
export function useSubscription(): SubscriptionContextValue {
    const context = useContext(SubscriptionContext);

    if (!context) {
        throw new Error(
            "useSubscription must be used within a SubscriptionProvider",
        );
    }

    return context;
}
