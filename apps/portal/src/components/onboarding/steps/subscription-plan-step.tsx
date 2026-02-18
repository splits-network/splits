"use client";

/**
 * Step 2: Subscription Plan Selection (Memphis Edition)
 * Allows recruiters to select a subscription plan and enter payment information
 * for paid plans (Pro/Partner). Charges immediately upon subscription.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useOnboarding } from "../onboarding-provider";
import { PricingCardGrid } from "@/components/pricing";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button, BillingToggle, Badge } from "@splits-network/memphis-ui";
import type { Plan } from "@/components/pricing/types";
import type { SelectedPlan } from "../types";

type ViewState = "select_plan" | "payment_collection" | "processing";

export function SubscriptionPlanStep() {
    const { state, actions } = useOnboarding();
    const { getToken } = useAuth();

    // View state
    const [viewState, setViewState] = useState<ViewState>("select_plan");

    // Plans data
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState<string | null>(null);

    // Stripe state
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [isAnnual, setIsAnnual] = useState(false);

    // Safety check: redirect non-recruiters if they somehow land here
    useEffect(() => {
        if (state.selectedRole && state.selectedRole !== "recruiter") {
            actions.setStep(3);
        }
    }, [state.selectedRole, actions]);

    // Fetch available plans
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

    // Handle plan selection
    const handlePlanSelect = async (plan: Plan) => {
        const selectedPlan: SelectedPlan = {
            id: plan.id,
            tier: plan.tier || "starter",
            name: plan.name,
            price_monthly: plan.price_monthly || 0,
            trial_days: plan.trial_days,
        };

        actions.setSelectedPlan(selectedPlan);

        // For free plan (starter), proceed directly
        if (plan.tier === "starter" || (plan.price_monthly || 0) === 0) {
            actions.setStep(3);
            return;
        }

        // For paid plans, create SetupIntent and show payment form
        setViewState("processing");
        setPaymentError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const apiClient = createAuthenticatedClient(token);
            const response = await apiClient.post(
                "/subscriptions/setup-intent",
                {
                    plan_id: plan.id,
                },
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
                error.message ||
                    "Failed to initialize payment. Please try again.",
            );
            setViewState("select_plan");
        }
    };

    // Handle successful payment method collection
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

    // Handle payment error
    const handlePaymentError = (error: string) => {
        setPaymentError(error);
    };

    // Handle back button
    const handleBack = () => {
        if (viewState === "payment_collection") {
            setViewState("select_plan");
            setClientSecret(null);
            actions.setSelectedPlan(null);
        } else {
            actions.setStep(1);
        }
    };

    // Render plan selection view
    if (viewState === "select_plan") {
        return (
            <div className="space-y-6 max-w-6xl">
                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                        Choose Your Plan
                    </h2>
                    <p className="text-dark/60 mt-2 text-sm">
                        Select a subscription plan that fits your recruiting
                        needs
                    </p>
                </div>

                {/* Error alerts */}
                {plansError && (
                    <div className="border-4 border-coral bg-coral/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                            <span className="text-sm font-bold text-dark">
                                {plansError}
                            </span>
                        </div>
                        <Button
                            color="coral"
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {paymentError && (
                    <div className="border-4 border-yellow bg-yellow/10 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-yellow"></i>
                        <span className="text-sm font-bold text-dark">
                            {paymentError}
                        </span>
                    </div>
                )}

                {/* Billing toggle */}
                <div className="flex justify-center py-2">
                    <div className="bg-dark p-3 border-4 border-dark">
                        <BillingToggle
                            annual={isAnnual}
                            onChange={setIsAnnual}
                            savingsBadge="Save ~16%"
                        />
                    </div>
                </div>

                {/* Plan cards */}
                <PricingCardGrid
                    plans={plans}
                    loading={plansLoading}
                    selectedPlanId={state.selectedPlan?.id || null}
                    onSelectPlan={handlePlanSelect}
                    variant="default"
                    isAnnual={isAnnual}
                />

                {/* Starter plan info */}
                <div className="border-4 border-teal bg-teal/10 p-4 flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-circle-info text-teal mt-0.5"></i>
                    <div>
                        <p className="font-black uppercase tracking-[0.15em] text-sm text-dark">
                            Start Free with Starter Plan
                        </p>
                        <p className="text-xs text-dark/60 mt-1">
                            Get started at no cost. Upgrade anytime to unlock
                            higher payout bonuses and premium features.
                        </p>
                    </div>
                </div>

                {state.error && (
                    <div className="border-4 border-coral bg-coral/10 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                        <span className="text-sm font-bold text-dark">
                            {state.error}
                        </span>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 justify-between items-center">
                    <Button
                        color="dark"
                        variant="outline"
                        onClick={handleBack}
                        disabled={state.submitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                        Back
                    </Button>
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-dark/40">
                        Select a plan to continue
                    </span>
                </div>
            </div>
        );
    }

    // Render processing state
    if (viewState === "processing") {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                        Setting Up Payment
                    </h2>
                    <p className="text-dark/60 mt-2 text-sm">
                        Preparing secure payment form...
                    </p>
                </div>

                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-teal border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    // Render payment collection view
    if (viewState === "payment_collection" && clientSecret) {
        const selectedPlanData = state.selectedPlan;

        return (
            <div className="space-y-6 max-w-3xl w-full mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                        Complete Your Subscription
                    </h2>
                    <p className="text-dark/60 mt-2 text-sm">
                        Enter your payment details to activate your subscription
                    </p>
                </div>

                {/* Selected plan summary */}
                {selectedPlanData && (
                    <div className="border-4 border-dark p-4 flex items-center justify-between">
                        <div>
                            <span className="font-black uppercase tracking-[0.15em] text-sm text-dark">
                                {selectedPlanData.name}
                            </span>
                            <span className="text-dark/60 ml-2 text-sm">
                                ${selectedPlanData.price_monthly}/month
                            </span>
                        </div>
                        <Button
                            color="dark"
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                        >
                            Change Plan
                        </Button>
                    </div>
                )}

                {paymentError && (
                    <div className="border-4 border-coral bg-coral/10 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                        <span className="text-sm font-bold text-dark">
                            {paymentError}
                        </span>
                    </div>
                )}

                {/* Stripe Payment Form */}
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

    // Fallback
    return null;
}
