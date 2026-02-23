"use client";

import { BaselStatusPill, BaselAlertBox } from "@splits-network/basel-ui";
import {
    subscriptionStatusColor,
    formatSubscriptionStatus,
    formatPrice,
    formatDate,
} from "./billing-utils";
import type { Plan } from "@/components/pricing/types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type SubscriptionStatus =
    | "active"
    | "past_due"
    | "canceled"
    | "trialing"
    | "incomplete";

interface Subscription {
    id: string;
    status: SubscriptionStatus;
    billing_period?: "monthly" | "annual";
    current_period_end: string | null;
    cancel_at: string | null;
    canceled_at: string | null;
}

interface PlanCardProps {
    subscription: Subscription;
    plan: Plan;
    onManagePlan: () => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

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

export function PlanCard({ subscription, plan, onManagePlan }: PlanCardProps) {
    const statusColor = subscriptionStatusColor(subscription.status);
    const price = plan.price_monthly ?? 0;
    const currency = plan.currency || "usd";
    const billingInterval = plan.billing_interval || "monthly";
    const features = getPlanFeatures(plan);

    return (
        <div className={`bg-base-200 border border-base-300 border-l-4 border-l-${statusColor} p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="font-black text-lg uppercase tracking-tight text-base-content">
                        {plan.name}
                    </h3>
                    <BaselStatusPill color={statusColor}>
                        {formatSubscriptionStatus(subscription.status)}
                    </BaselStatusPill>
                </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-black text-base-content mb-1">
                {formatPrice(price, currency)}
                <span className="text-base font-normal text-base-content/50">
                    /{billingInterval === "annual" ? "year" : "month"}
                </span>
            </div>

            {plan.description && (
                <p className="text-sm text-base-content/60 mb-4">
                    {plan.description}
                </p>
            )}

            {/* Renewal info */}
            {subscription.current_period_end && (
                <div className="text-sm text-base-content/60 flex items-center gap-2 mb-4">
                    <i className="fa-duotone fa-regular fa-calendar-clock text-primary" />
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
                <BaselAlertBox variant="warning" className="mb-4">
                    <span className="font-bold">Subscription Canceled</span>
                    <br />
                    Canceled on {formatDate(subscription.canceled_at)}.
                    {subscription.cancel_at && (
                        <> You&apos;ll retain access until {formatDate(subscription.cancel_at)}.</>
                    )}
                </BaselAlertBox>
            )}

            {/* Past due notice */}
            {subscription.status === "past_due" && (
                <BaselAlertBox variant="error" className="mb-4">
                    <span className="font-bold">Payment Required</span>
                    <br />
                    Your last payment failed. Update your payment method to avoid service interruption.
                </BaselAlertBox>
            )}

            {/* Features */}
            <div className="space-y-2 mb-5">
                {features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-check text-success text-sm" />
                        <span className="text-sm text-base-content">{feature}</span>
                    </div>
                ))}
                {features.length > 5 && (
                    <p className="text-sm text-base-content/40 ml-6">
                        +{features.length - 5} more features
                    </p>
                )}
            </div>

            {/* Action */}
            <button
                className="btn btn-outline btn-primary btn-sm w-full"
                onClick={onManagePlan}
            >
                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                Manage Plan
            </button>
        </div>
    );
}
