"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselAlertBox,
    BaselEmptyState,
    BaselStatusPill,
} from "@splits-network/basel-ui";
import { BaselPlanModal } from "./basel-plan-modal";
import type { Plan } from "@/components/pricing/types";
import {
    subscriptionStatusColor,
    formatSubscriptionStatus,
    formatDate,
    formatPrice,
} from "./billing-utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

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
    plan?: Plan;
}

function getPlanFeatures(plan: Plan | null | undefined): string[] {
    const DEFAULT_FEATURES = [
        "Access to job marketplace",
        "Candidate management tools",
        "Application tracking",
        "Email notifications",
    ];
    if (!plan?.features) return DEFAULT_FEATURES;

    const features: Record<string, any> = plan.features;
    if (Array.isArray(features.included)) return features.included;
    if (Array.isArray(features.list)) return features.list;

    if (typeof features === "object") {
        return Object.entries(features)
            .filter(([, enabled]) => enabled === true)
            .map(([feature]) =>
                feature
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
            );
    }

    return DEFAULT_FEATURES;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function SubscriptionSection() {
    const { getToken } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(
        null,
    );
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);

    const fetchSubscription = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const subResponse = await client.get<{ data: Subscription }>(
                "/subscriptions/me",
            );
            const subscriptionData = subResponse.data;
            setSubscription(subscriptionData);

            if (subscriptionData?.plan_id) {
                try {
                    const planResponse = await client.get<{
                        data: Plan;
                    }>(`/plans/${subscriptionData.plan_id}`);
                    setPlan(planResponse.data);
                } catch (planErr) {
                    console.warn(
                        "Could not fetch plan details:",
                        planErr,
                    );
                }
            }
        } catch (err: any) {
            console.error("Failed to fetch subscription:", err);
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

    /* ── Loading ──────────────────────────────────────────────────────────── */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    /* ── Error ────────────────────────────────────────────────────────────── */

    if (error) {
        return (
            <div>
                <h2 className="text-xl font-black tracking-tight mb-1">
                    Subscription
                </h2>
                <p className="text-base text-base-content/50 mb-8">
                    Manage your plan and billing cycle.
                </p>
                <BaselAlertBox variant="error">
                    {error}
                </BaselAlertBox>
                <button
                    className="btn btn-outline btn-sm mt-4"
                    onClick={fetchSubscription}
                >
                    <i className="fa-duotone fa-regular fa-rotate-right" />
                    Retry
                </button>
            </div>
        );
    }

    /* ── No subscription ──────────────────────────────────────────────────── */

    if (!subscription) {
        return (
            <div>
                <h2 className="text-xl font-black tracking-tight mb-1">
                    Subscription
                </h2>
                <p className="text-base text-base-content/50 mb-8">
                    Manage your plan and billing cycle.
                </p>
                <BaselEmptyState
                    icon="fa-duotone fa-regular fa-box"
                    title="No Active Subscription"
                    description="Subscribe to a plan to access all recruiter features."
                    actions={[
                        {
                            label: "View Plans",
                            style: "btn-primary",
                            onClick: () => setShowPlanModal(true),
                        },
                    ]}
                />

                {showPlanModal && (
                    <BaselPlanModal
                        isOpen={showPlanModal}
                        onClose={() => setShowPlanModal(false)}
                        currentSubscription={null}
                        currentPlan={null}
                        onPlanChanged={() => {
                            setShowPlanModal(false);
                            fetchSubscription();
                        }}
                    />
                )}
            </div>
        );
    }

    /* ── Active subscription ──────────────────────────────────────────────── */

    const planName = plan?.name || "Recruiter Plan";
    const planDescription =
        plan?.description ||
        "Full access to job opportunities and candidate management";
    const price = plan?.price_monthly || 99;
    const currency = plan?.currency || "usd";
    const billingInterval = plan?.billing_interval || "monthly";
    const features = getPlanFeatures(plan);

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Subscription
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your plan and billing cycle.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan details */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-black text-lg uppercase tracking-tight text-base-content">
                            {planName}
                        </h3>
                        <BaselStatusPill
                            color={subscriptionStatusColor(
                                subscription.status,
                            )}
                        >
                            {formatSubscriptionStatus(subscription.status)}
                        </BaselStatusPill>
                    </div>

                    <p className="text-sm text-base-content/60 mb-4">
                        {planDescription}
                    </p>

                    <div className="text-3xl font-black text-base-content">
                        {formatPrice(price, currency)}
                        <span className="text-base font-normal text-base-content/50">
                            /
                            {billingInterval === "annual"
                                ? "year"
                                : "month"}
                        </span>
                    </div>

                    {/* Renewal info */}
                    {subscription.current_period_end && (
                        <div className="mt-4 text-sm text-base-content/60 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-calendar-clock text-primary" />
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
                        <BaselAlertBox variant="warning" className="mt-4">
                            <span className="font-bold">
                                Subscription Canceled
                            </span>
                            <br />
                            Your subscription was canceled on{" "}
                            {formatDate(subscription.canceled_at)}.
                            {subscription.cancel_at && (
                                <>
                                    {" "}
                                    You&apos;ll retain access until{" "}
                                    {formatDate(subscription.cancel_at)}.
                                </>
                            )}
                        </BaselAlertBox>
                    )}

                    {/* Past due notice */}
                    {subscription.status === "past_due" && (
                        <BaselAlertBox variant="error" className="mt-4">
                            <span className="font-bold">
                                Payment Required
                            </span>
                            <br />
                            Your last payment failed. Please update your
                            payment method to avoid service interruption.
                        </BaselAlertBox>
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
                                <i className="fa-duotone fa-regular fa-check text-success text-sm" />
                                <span className="text-sm text-base-content">
                                    {feature}
                                </span>
                            </div>
                        ))}
                        {features.length > 5 && (
                            <p className="text-sm text-base-content/40 ml-6">
                                +{features.length - 5} more features
                            </p>
                        )}
                    </div>

                    <button
                        className="btn btn-outline btn-primary"
                        onClick={() => setShowPlanModal(true)}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                        Manage Plan
                    </button>
                </div>
            </div>

            {showPlanModal && (
                <BaselPlanModal
                    isOpen={showPlanModal}
                    onClose={() => setShowPlanModal(false)}
                    currentSubscription={subscription}
                    currentPlan={plan}
                    onPlanChanged={() => {
                        setShowPlanModal(false);
                        fetchSubscription();
                    }}
                />
            )}
        </div>
    );
}
