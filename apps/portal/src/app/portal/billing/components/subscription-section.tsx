"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    DetailSection,
    SettingsField,
    Badge,
    Button,
    AlertBanner,
} from "@splits-network/memphis-ui";
import { subscriptionStatusVariant } from "./accent";
import PlanModal from "./plan-modal";
import type { Plan } from "@/components/pricing/types";

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

function formatDate(dateString: string | null): string {
    if (!dateString) return "\u2014";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatPrice(amount: number, currency: string = "usd"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatStatus(status: SubscriptionStatus): string {
    const labels: Record<SubscriptionStatus, string> = {
        active: "Active",
        trialing: "Trial",
        past_due: "Past Due",
        canceled: "Canceled",
        incomplete: "Incomplete",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
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

interface SubscriptionSectionProps {
    onStatsChange: (stats: {
        planName: string;
        status: string;
        nextRenewal: string;
        monthlyCost: string;
    }) => void;
}

export default function SubscriptionSection({
    onStatsChange,
}: SubscriptionSectionProps) {
    const { getToken } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
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

    // Push stats up to header
    useEffect(() => {
        if (loading) return;

        const planName = plan?.name || (subscription ? "Active Plan" : "None");
        const status = subscription
            ? formatStatus(subscription.status)
            : "No Plan";
        const nextRenewal =
            subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                  )
                : "\u2014";
        const monthlyCost = plan
            ? formatPrice(plan.price_monthly, plan.currency)
            : "$0";

        onStatsChange({ planName, status, nextRenewal, monthlyCost });
    }, [loading, subscription, plan, onStatsChange]);

    if (loading) {
        return (
            <DetailSection
                title="Current Plan"
                icon="fa-duotone fa-regular fa-box"
                accent="coral"
            >
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md" />
                    <span className="ml-3 text-sm text-dark/50">
                        Loading subscription...
                    </span>
                </div>
            </DetailSection>
        );
    }

    if (error) {
        return (
            <DetailSection
                title="Current Plan"
                icon="fa-duotone fa-regular fa-box"
                accent="coral"
            >
                <AlertBanner type="error" onDismiss={() => setError(null)}>
                    {error}
                </AlertBanner>
                <Button
                    color="coral"
                    variant="outline"
                    size="sm"
                    onClick={fetchSubscription}
                    className="mt-4"
                >
                    <i className="fa-duotone fa-regular fa-rotate-right mr-1" />
                    Retry
                </Button>
            </DetailSection>
        );
    }

    if (!subscription) {
        return (
            <>
                <DetailSection
                    title="Current Plan"
                    icon="fa-duotone fa-regular fa-box"
                    accent="coral"
                >
                    <div className="text-center py-6">
                        <i className="fa-duotone fa-regular fa-box text-4xl text-dark/20 mb-4 block" />
                        <p className="text-sm font-bold text-dark mb-1">
                            No Active Subscription
                        </p>
                        <p className="text-sm text-dark/50 mb-4">
                            Subscribe to a plan to access all recruiter features.
                        </p>
                        <Button
                            color="coral"
                            onClick={() => setShowPlanModal(true)}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right mr-1" />
                            View Plans
                        </Button>
                    </div>
                </DetailSection>

                {showPlanModal && (
                    <PlanModal
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
            </>
        );
    }

    const planName = plan?.name || "Recruiter Plan";
    const planDescription =
        plan?.description || "Full access to job opportunities and candidate management";
    const price = plan?.price_monthly || 99;
    const currency = plan?.currency || "usd";
    const billingInterval = plan?.billing_interval || "monthly";
    const features = getPlanFeatures(plan);

    return (
        <>
            <DetailSection
                title="Current Plan"
                icon="fa-duotone fa-regular fa-box"
                accent="coral"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan details */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-black text-lg uppercase tracking-tight text-dark">
                                {planName}
                            </h3>
                            <Badge
                                color={subscriptionStatusVariant(subscription.status)}
                                size="sm"
                            >
                                {formatStatus(subscription.status)}
                            </Badge>
                        </div>

                        <p className="text-sm text-dark/60 mb-4">
                            {planDescription}
                        </p>

                        <div className="text-3xl font-black text-dark">
                            {formatPrice(price, currency)}
                            <span className="text-base font-normal text-dark/50">
                                /{billingInterval === "annual" ? "year" : "month"}
                            </span>
                        </div>

                        {/* Renewal info */}
                        {subscription.current_period_end && (
                            <div className="mt-4 text-sm text-dark/60 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-calendar-clock text-purple" />
                                {subscription.status === "active" ? (
                                    <>Next renewal: {formatDate(subscription.current_period_end)}</>
                                ) : subscription.cancel_at ? (
                                    <>Access until: {formatDate(subscription.cancel_at)}</>
                                ) : (
                                    <>Current period ends: {formatDate(subscription.current_period_end)}</>
                                )}
                            </div>
                        )}

                        {/* Cancellation notice */}
                        {subscription.canceled_at && (
                            <AlertBanner type="warning" className="mt-4">
                                <span className="font-bold">Subscription Canceled</span>
                                <br />
                                Your subscription was canceled on{" "}
                                {formatDate(subscription.canceled_at)}.
                                {subscription.cancel_at && (
                                    <>
                                        {" "}You&apos;ll retain access until{" "}
                                        {formatDate(subscription.cancel_at)}.
                                    </>
                                )}
                            </AlertBanner>
                        )}

                        {/* Past due notice */}
                        {subscription.status === "past_due" && (
                            <AlertBanner type="error" className="mt-4">
                                <span className="font-bold">Payment Required</span>
                                <br />
                                Your last payment failed. Please update your payment
                                method to avoid service interruption.
                            </AlertBanner>
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
                                    <i className="fa-duotone fa-regular fa-check text-teal text-sm" />
                                    <span className="text-sm text-dark">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                            {features.length > 5 && (
                                <p className="text-sm text-dark/40 ml-6">
                                    +{features.length - 5} more features
                                </p>
                            )}
                        </div>

                        <Button
                            color="coral"
                            variant="outline"
                            onClick={() => setShowPlanModal(true)}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square mr-1" />
                            Manage Plan
                        </Button>
                    </div>
                </div>
            </DetailSection>

            {showPlanModal && (
                <PlanModal
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
        </>
    );
}
