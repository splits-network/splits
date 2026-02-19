"use client";

/**
 * Step 2: Subscription Plan Selection (Basel Edition)
 * Recruiters select a plan and enter payment for paid plans.
 * Reuses existing PricingCardGrid and Stripe components (no Memphis deps).
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PricingCardGrid } from "@/components/pricing";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { Plan } from "@/components/pricing/types";
import type { OnboardingState, OnboardingActions, SelectedPlan } from "../types";

type ViewState = "select_plan" | "payment_collection" | "processing";

interface PlanStepProps {
    state: OnboardingState;
    actions: OnboardingActions;
}

export function PlanStep({ state, actions }: PlanStepProps) {
    const { getToken } = useAuth();

    const [viewState, setViewState] = useState<ViewState>("select_plan");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [isAnnual, setIsAnnual] = useState(false);

    // Safety: redirect non-recruiters
    useEffect(() => {
        if (state.selectedRole && state.selectedRole !== "recruiter") {
            actions.setStep(3);
        }
    }, [state.selectedRole, actions]);

    // Fetch plans
    useEffect(() => {
        const fetchPlans = async () => {
            setPlansLoading(true);
            setPlansError(null);
            try {
                const token = await getToken();
                if (!token) throw new Error("No authentication token");
                const apiClient = createAuthenticatedClient(token);
                const response = await apiClient.get("/plans");
                if (response?.data) {
                    const recruiterPlans = (
                        Array.isArray(response.data)
                            ? response.data
                            : [response.data]
                    )
                        .filter((plan: Plan) => plan.is_active !== false)
                        .sort(
                            (a: Plan, b: Plan) =>
                                (a.price_monthly || 0) - (b.price_monthly || 0),
                        );
                    setPlans(recruiterPlans);
                }
            } catch (error: any) {
                console.error("Failed to fetch plans:", error);
                setPlansError(
                    error.message || "Failed to load subscription plans",
                );
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePlanSelect = async (plan: Plan) => {
        const selectedPlan: SelectedPlan = {
            id: plan.id,
            tier: plan.tier || "starter",
            name: plan.name,
            price_monthly: plan.price_monthly || 0,
            trial_days: plan.trial_days,
        };
        actions.setSelectedPlan(selectedPlan);

        // Free plan → skip payment
        if (plan.tier === "starter" || (plan.price_monthly || 0) === 0) {
            actions.setStep(3);
            return;
        }

        // Paid plan → setup intent
        setViewState("processing");
        setPaymentError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");
            const apiClient = createAuthenticatedClient(token);
            const response = await apiClient.post(
                "/subscriptions/setup-intent",
                { plan_id: plan.id },
            );
            if (response?.data) {
                setClientSecret(response.data.client_secret);
                setCustomerId(response.data.customer_id);
                setViewState("payment_collection");
            } else {
                throw new Error("Failed to initialize payment");
            }
        } catch (error: any) {
            console.error("Failed to create setup intent:", error);
            setPaymentError(
                error.message || "Failed to initialize payment. Please try again.",
            );
            setViewState("select_plan");
        }
    };

    const handlePaymentSuccess = (paymentMethodId: string) => {
        if (!customerId) {
            setPaymentError("Missing customer information. Please try again.");
            setViewState("select_plan");
            return;
        }
        actions.setStripePaymentInfo({
            customerId,
            paymentMethodId,
            appliedDiscount,
        });
        actions.setStep(3);
    };

    const handleBack = () => {
        if (viewState === "payment_collection") {
            setViewState("select_plan");
            setClientSecret(null);
            actions.setSelectedPlan(null);
        } else {
            actions.setStep(1);
        }
    };

    // ── Plan Selection View ──
    if (viewState === "select_plan") {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                        Step 2
                    </p>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Choose Your Plan
                    </h1>
                    <p className="text-base-content/50">
                        Select a subscription plan that fits your recruiting needs.
                    </p>
                </div>

                {plansError && (
                    <div className="border-l-4 border-error bg-error/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                            <span className="text-sm font-semibold">
                                {plansError}
                            </span>
                        </div>
                        <button
                            className="btn btn-outline btn-error btn-sm"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {paymentError && (
                    <div className="border-l-4 border-warning bg-warning/5 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning" />
                        <span className="text-sm font-semibold">
                            {paymentError}
                        </span>
                    </div>
                )}

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-3">
                    <span
                        className={`text-sm font-semibold ${!isAnnual ? "text-base-content" : "text-base-content/40"}`}
                    >
                        Monthly
                    </span>
                    <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={isAnnual}
                        onChange={(e) => setIsAnnual(e.target.checked)}
                    />
                    <span
                        className={`text-sm font-semibold ${isAnnual ? "text-base-content" : "text-base-content/40"}`}
                    >
                        Annual
                    </span>
                    {isAnnual && (
                        <span className="badge badge-success badge-sm text-[10px]">
                            Save ~16%
                        </span>
                    )}
                </div>

                <PricingCardGrid
                    plans={plans}
                    loading={plansLoading}
                    selectedPlanId={state.selectedPlan?.id || null}
                    onSelectPlan={handlePlanSelect}
                    variant="default"
                    isAnnual={isAnnual}
                />

                {/* Starter info */}
                <div className="border-l-4 border-info bg-info/5 p-4 flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-circle-info text-info mt-0.5" />
                    <div>
                        <p className="text-sm font-bold">
                            Start Free with Starter Plan
                        </p>
                        <p className="text-xs text-base-content/50 mt-1">
                            Get started at no cost. Upgrade anytime to unlock
                            higher payout bonuses and premium features.
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300">
                    <button className="btn btn-ghost" onClick={handleBack}>
                        <i className="fa-solid fa-arrow-left text-xs" /> Back
                    </button>
                    <span className="text-xs text-base-content/30">
                        Select a plan to continue
                    </span>
                </div>
            </div>
        );
    }

    // ── Processing View ──
    if (viewState === "processing") {
        return (
            <div className="space-y-6 py-12 text-center">
                <h1 className="text-3xl font-black tracking-tight">
                    Setting Up Payment
                </h1>
                <p className="text-base-content/50">
                    Preparing secure payment form...
                </p>
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    // ── Payment Collection View ──
    if (viewState === "payment_collection" && clientSecret) {
        const selectedPlanData = state.selectedPlan;
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                        Payment
                    </p>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Complete Your Subscription
                    </h1>
                    <p className="text-base-content/50">
                        Enter your payment details to activate your subscription.
                    </p>
                </div>

                {selectedPlanData && (
                    <div className="border border-base-300 bg-base-200 p-4 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-sm">
                                {selectedPlanData.name}
                            </span>
                            <span className="text-base-content/50 ml-2 text-sm">
                                ${selectedPlanData.price_monthly}/month
                            </span>
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleBack}
                        >
                            Change Plan
                        </button>
                    </div>
                )}

                {paymentError && (
                    <div className="border-l-4 border-error bg-error/5 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        <span className="text-sm font-semibold">
                            {paymentError}
                        </span>
                    </div>
                )}

                <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                        onPaymentSuccess={handlePaymentSuccess}
                        onCancel={() => setViewState("select_plan")}
                        submitButtonText="Subscribe Now"
                        allowDiscountCode={true}
                        planId={selectedPlanData?.id}
                        billingPeriod="monthly"
                        onDiscountApplied={setAppliedDiscount}
                    />
                </StripeProvider>
            </div>
        );
    }

    return null;
}
