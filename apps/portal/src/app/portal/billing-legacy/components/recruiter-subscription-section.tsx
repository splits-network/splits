"use client";

/**
 * Recruiter Subscription Section Component
 *
 * Displays current subscription details for recruiters including:
 * - Plan name and pricing
 * - Billing period and renewal date
 * - Plan features
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import PlanChangeModal from "./plan-change-modal";

/**
 * Subscription data from API
 */
type SubscriptionStatus =
    | "active"
    | "past_due"
    | "canceled"
    | "trialing"
    | "incomplete";

type BillingPeriod = "monthly" | "annual";

interface Subscription {
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
    // Enriched data
    plan?: Plan;
}

/**
 * Plan data from API
 */
type BillingInterval = "monthly" | "annual";
type PlanStatus = "active" | "archived";
type PlanTier = "starter" | "pro" | "partner";

interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: PlanTier;
    description: string | null;
    price_monthly: number;
    price_annual: number;
    currency: string;
    billing_interval: BillingInterval;
    features: Record<string, any>;
    status: PlanStatus;
    stripe_product_id: string | null;
    stripe_price_id_monthly: string | null;
    stripe_price_id_annual: string | null;
    trial_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status: SubscriptionStatus): string {
    const statusClasses: Record<SubscriptionStatus, string> = {
        active: "badge-success",
        trialing: "badge-info",
        past_due: "badge-warning",
        canceled: "badge-error",
        incomplete: "badge-warning",
    };
    return statusClasses[status] || "badge-neutral";
}

/**
 * Format status label
 */
function formatStatus(status: SubscriptionStatus): string {
    const statusLabels: Record<SubscriptionStatus, string> = {
        active: "Active",
        trialing: "Trial",
        past_due: "Past Due",
        canceled: "Canceled",
        incomplete: "Incomplete",
    };
    return (
        statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)
    );
}

/**
 * Format date from ISO string
 */
function formatDate(dateString: string | null): string {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Format currency amount
 */
function formatPrice(amount: number, currency: string = "usd"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Default features to display if plan features are empty
 */
const DEFAULT_FEATURES = [
    "Access to job marketplace",
    "Candidate management tools",
    "Application tracking",
    "Email notifications",
];

/**
 * Get features list from plan
 */
function getPlanFeatures(plan: Plan | null | undefined): string[] {
    if (!plan?.features) return DEFAULT_FEATURES;

    // If features is an object with a list property
    if (Array.isArray(plan.features.list)) {
        return plan.features.list;
    }

    // If features is an object with boolean values
    if (typeof plan.features === "object") {
        return Object.entries(plan.features)
            .filter(([, enabled]) => enabled === true)
            .map(([feature]) =>
                feature
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
            );
    }

    return DEFAULT_FEATURES;
}

export default function RecruiterSubscriptionSection() {
    const { getToken } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);

    /**
     * Fetch subscription and plan data
     */
    const fetchSubscription = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            // Fetch subscription
            const subResponse = await client.get<{ data: Subscription }>(
                "/subscriptions/me",
            );
            const subscriptionData = subResponse.data;
            setSubscription(subscriptionData);

            // Fetch plan details if we have a plan_id
            if (subscriptionData?.plan_id) {
                try {
                    const planResponse = await client.get<{ data: Plan }>(
                        `/plans/${subscriptionData.plan_id}`,
                    );
                    setPlan(planResponse.data);
                } catch (planErr) {
                    console.warn("Could not fetch plan details:", planErr);
                }
            }
        } catch (err: any) {
            console.error("Failed to fetch subscription:", err);
            // If no subscription exists, show appropriate state
            if (
                err.message?.includes("No active subscription") ||
                err.message?.includes("not found")
            ) {
                setSubscription(null);
            } else {
                setError(err.message || "Failed to load subscription");
            }
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    // Loading state
    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-box"></i>
                        Current Plan
                    </h2>
                    <div className="divider my-2"></div>
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                        <span className="ml-3 text-base-content/70">
                            Loading subscription...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-box"></i>
                        Current Plan
                    </h2>
                    <div className="divider my-2"></div>
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={fetchSubscription}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No subscription state
    if (!subscription) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-box"></i>
                        Current Plan
                    </h2>
                    <div className="divider my-2"></div>
                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-info-circle"></i>
                        <div>
                            <div className="font-semibold">
                                No Active Subscription
                            </div>
                            <div className="text-sm">
                                Subscribe to a plan to access all recruiter
                                features.
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={() => setShowPlanModal(true)}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        View Plans
                    </button>
                </div>

                {/* Plan Change Modal */}
                <PlanChangeModal
                    isOpen={showPlanModal}
                    onClose={() => setShowPlanModal(false)}
                    currentSubscription={null}
                    currentPlan={null}
                    onPlanChanged={() => {
                        setShowPlanModal(false);
                        fetchSubscription();
                    }}
                />
            </div>
        );
    }

    // Get plan info
    const planName = plan?.name || "Recruiter Plan";
    const planDescription =
        plan?.description ||
        "Full access to job opportunities and candidate management";
    const price = plan?.price_monthly || 99;
    const currency = plan?.currency || "usd";
    const billingInterval = plan?.billing_interval || "monthly";
    const features = getPlanFeatures(plan);

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-box"></i>
                    Current Plan
                    <div
                        className={`badge ${getStatusBadgeClass(subscription.status)}`}
                    >
                        {formatStatus(subscription.status)}
                    </div>
                </h2>
                <div className="divider my-2"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan details */}
                    <div>
                        <h3 className="font-semibold text-lg mb-2">
                            {planName}
                        </h3>
                        <p className="text-base-content/70 mb-4">
                            {planDescription}
                        </p>

                        <div className="text-2xl font-bold">
                            {formatPrice(price, currency)}
                            <span className="text-base font-normal text-base-content/70">
                                /
                                {billingInterval === "annual"
                                    ? "year"
                                    : "month"}
                            </span>
                        </div>

                        {/* Renewal info */}
                        {subscription.current_period_end && (
                            <div className="mt-4 text-sm text-base-content/70">
                                <i className="fa-duotone fa-regular fa-calendar-clock mr-2"></i>
                                {subscription.status === "active" ? (
                                    <>
                                        Next renewal:{" "}
                                        {formatDate(
                                            subscription.current_period_end,
                                        )}
                                    </>
                                ) : subscription.cancel_at ? (
                                    <>
                                        Access until:{" "}
                                        {formatDate(subscription.cancel_at)}
                                    </>
                                ) : (
                                    <>
                                        Current period ends:{" "}
                                        {formatDate(
                                            subscription.current_period_end,
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Cancellation notice */}
                        {subscription.canceled_at && (
                            <div className="alert alert-warning mt-4">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div className="text-sm">
                                    <div className="font-medium">
                                        Subscription Canceled
                                    </div>
                                    <div>
                                        Your subscription was canceled on{" "}
                                        {formatDate(subscription.canceled_at)}.
                                        {subscription.cancel_at && (
                                            <>
                                                {" "}
                                                You'll retain access until{" "}
                                                {formatDate(
                                                    subscription.cancel_at,
                                                )}
                                                .
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Past due notice */}
                        {subscription.status === "past_due" && (
                            <div className="alert alert-error mt-4">
                                <i className="fa-duotone fa-regular fa-credit-card"></i>
                                <div className="text-sm">
                                    <div className="font-medium">
                                        Payment Required
                                    </div>
                                    <div>
                                        Your last payment failed. Please update
                                        your payment method to avoid service
                                        interruption.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features list */}
                    <div className="flex flex-col justify-between">
                        <div className="space-y-2 mb-4">
                            {features.slice(0, 5).map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                            {features.length > 5 && (
                                <div className="text-sm text-base-content/60 ml-6">
                                    +{features.length - 5} more features
                                </div>
                            )}
                        </div>

                        <button
                            className="btn btn-outline"
                            onClick={() => setShowPlanModal(true)}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
                            Manage Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Change Modal */}
            <PlanChangeModal
                isOpen={showPlanModal}
                onClose={() => setShowPlanModal(false)}
                currentSubscription={subscription}
                currentPlan={plan}
                onPlanChanged={() => {
                    setShowPlanModal(false);
                    fetchSubscription();
                }}
            />
        </div>
    );
}
