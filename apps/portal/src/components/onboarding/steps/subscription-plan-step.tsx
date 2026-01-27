"use client";

/**
 * Step 2: Subscription Plan Selection
 * Allows recruiters to select a subscription plan and enter payment information
 * for paid plans (Pro/Partner). Charges immediately upon subscription.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useOnboarding } from "../onboarding-provider";
import { PricingCardGrid } from "@/components/pricing";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { createAuthenticatedClient } from "@/lib/api-client";
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
                    // Filter to only recruiter plans and sort by price
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
    }, [getToken]);

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
            // No payment needed, move to next step
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

        // Store payment info in onboarding state
        actions.setStripePaymentInfo({
            customerId,
            paymentMethodId,
        });

        // Move to next step
        actions.setStep(3);
    };

    // Handle payment error
    const handlePaymentError = (error: string) => {
        setPaymentError(error);
    };

    // Handle back button
    const handleBack = () => {
        if (viewState === "payment_collection") {
            // Go back to plan selection
            setViewState("select_plan");
            setClientSecret(null);
            actions.setSelectedPlan(null);
        } else {
            // Go back to previous step
            actions.setStep(1);
        }
    };

    // Render plan selection view
    if (viewState === "select_plan") {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                    <p className="text-base-content/70 mt-2">
                        Select a subscription plan that fits your recruiting
                        needs
                    </p>
                </div>

                {plansError && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{plansError}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {paymentError && (
                    <div className="alert alert-warning">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                        <span>{paymentError}</span>
                    </div>
                )}

                <PricingCardGrid
                    plans={plans}
                    loading={plansLoading}
                    selectedPlanId={state.selectedPlan?.id || null}
                    onSelectPlan={handlePlanSelect}
                    variant="compact"
                />

                {/* Starter plan info */}
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                    <div>
                        <p className="font-semibold">
                            Start Free with Starter Plan
                        </p>
                        <p className="text-sm">
                            Get started at no cost. Upgrade anytime to unlock
                            higher payout bonuses and premium features.
                        </p>
                    </div>
                </div>

                {state.error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="btn"
                        disabled={state.submitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        Back
                    </button>
                    <div className="text-sm text-base-content/50 self-center">
                        Select a plan to continue
                    </div>
                </div>
            </div>
        );
    }

    // Render processing state
    if (viewState === "processing") {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Setting Up Payment</h2>
                    <p className="text-base-content/70 mt-2">
                        Preparing secure payment form...
                    </p>
                </div>

                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            </div>
        );
    }

    // Render payment collection view
    if (viewState === "payment_collection" && clientSecret) {
        const selectedPlanData = state.selectedPlan;

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Complete Your Subscription
                    </h2>
                    <p className="text-base-content/70 mt-2">
                        Enter your payment details to activate your subscription
                    </p>
                </div>

                {/* Selected plan summary */}
                {selectedPlanData && (
                    <div className="card card-border bg-base-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold">
                                    {selectedPlanData.name}
                                </span>
                                <span className="text-base-content/70 ml-2">
                                    ${selectedPlanData.price_monthly}/month
                                </span>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={handleBack}
                            >
                                Change Plan
                            </button>
                        </div>
                    </div>
                )}

                {paymentError && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{paymentError}</span>
                    </div>
                )}

                {/* Stripe Payment Form */}
                <div className="card card-border p-6">
                    <StripeProvider clientSecret={clientSecret}>
                        <PaymentForm
                            onPaymentSuccess={handlePaymentSuccess}
                            onCancel={() => setViewState("select_plan")}
                            submitButtonText="Subscribe Now"
                        />
                    </StripeProvider>
                </div>

                {/* Security note */}
                <div className="text-center text-sm text-base-content/50">
                    <i className="fa-duotone fa-regular fa-lock mr-1"></i>
                    Your payment information is securely processed by Stripe
                </div>

                {/* Back button */}
                <div className="flex justify-start">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="btn btn-ghost"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        Back to Plans
                    </button>
                </div>
            </div>
        );
    }

    // Fallback
    return null;
}
