"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselWizardModal,
    BaselAlertBox,
    BaselStatusPill,
    BaselReviewSection,
} from "@splits-network/basel-ui";
import { ModalPortal, ButtonLoading } from "@splits-network/shared-ui";
import { BaselPricingCardGrid } from "./basel-pricing-card-grid";
import type { Plan } from "@/components/pricing/types";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { formatPrice } from "./billing-utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type BillingPeriod = "monthly" | "annual";
type WizardStep = "select-plan" | "payment" | "confirm";

interface Subscription {
    id: string;
    plan_id: string;
    billing_period?: BillingPeriod;
    status: string;
}

interface SetupIntentResponse {
    client_secret: string;
    customer_id: string;
}

interface PaymentMethodResponse {
    has_payment_method: boolean;
    default_payment_method: {
        id: string;
        card?: {
            brand: string;
            last4: string;
            exp_month: number;
            exp_year: number;
        };
    } | null;
}

interface BaselPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSubscription: Subscription | null;
    currentPlan: Plan | null;
    onPlanChanged: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BaselPlanModal({
    isOpen,
    onClose,
    currentSubscription,
    currentPlan,
    onPlanChanged,
}: BaselPlanModalProps) {
    const { getToken } = useAuth();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
        currentSubscription?.billing_period || "monthly",
    );
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
        currentPlan?.id || null,
    );

    const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean | null>(
        null,
    );
    const [setupIntent, setSetupIntent] =
        useState<SetupIntentResponse | null>(null);
    const [creatingSetupIntent, setCreatingSetupIntent] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<string | null>(
        null,
    );
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [currentStep, setCurrentStep] =
        useState<WizardStep>("select-plan");

    /* ── Data fetching ────────────────────────────────────────────────────── */

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{
                data: Plan[];
                pagination: any;
            }>("/plans?status=active&limit=50");

            const activePlans = (response.data || [])
                .filter((p) => p.is_active)
                .sort((a, b) => a.price_monthly - b.price_monthly);

            setPlans(activePlans);
        } catch (err: any) {
            console.error("Failed to fetch plans:", err);
            setError(err.message || "Failed to load plans");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkPaymentMethod = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{
                data: PaymentMethodResponse;
            }>("/subscriptions/payment-methods");
            setHasPaymentMethod(
                response.data?.has_payment_method ?? false,
            );
        } catch {
            setHasPaymentMethod(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createSetupIntentFn = useCallback(
        async (planId: string) => {
            try {
                setCreatingSetupIntent(true);
                setError(null);

                const token = await getToken();
                if (!token) throw new Error("Authentication required");

                const client = createAuthenticatedClient(token);
                const response = await client.post<{
                    data: SetupIntentResponse;
                }>("/subscriptions/setup-intent", { plan_id: planId });

                setSetupIntent(response.data);
            } catch (err: any) {
                console.error("Failed to create setup intent:", err);
                setError(
                    err.message || "Failed to initialize payment form",
                );
            } finally {
                setCreatingSetupIntent(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    /* ── Handlers ─────────────────────────────────────────────────────────── */

    const handlePaymentSuccess = (newPaymentMethodId: string) => {
        setPaymentMethodId(newPaymentMethodId);
        setHasPaymentMethod(true);
    };

    const handleConfirm = async () => {
        if (!selectedPlanId) return;

        const selectedPlan = plans.find((p) => p.id === selectedPlanId);
        const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;

        if (isPaidPlan && !hasPaymentMethod && !paymentMethodId) {
            await createSetupIntentFn(selectedPlanId);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const client = createAuthenticatedClient(token);

            if (currentSubscription) {
                const updateData: Record<string, any> = {
                    plan_id: selectedPlanId,
                    billing_period: billingPeriod,
                };
                if (appliedDiscount?.code) {
                    updateData.promotion_code = appliedDiscount.code;
                }
                await client.patch(
                    `/subscriptions/${currentSubscription.id}`,
                    updateData,
                );
            } else {
                const activateData: Record<string, any> = {
                    plan_id: selectedPlanId,
                    billing_period: billingPeriod,
                };
                if (
                    isPaidPlan &&
                    paymentMethodId &&
                    setupIntent?.customer_id
                ) {
                    activateData.payment_method_id = paymentMethodId;
                    activateData.customer_id = setupIntent.customer_id;
                }
                if (appliedDiscount?.code) {
                    activateData.promotion_code = appliedDiscount.code;
                }
                await client.post("/subscriptions/activate", activateData);
            }

            onPlanChanged();
            onClose();
        } catch (err: any) {
            console.error("Failed to change plan:", err);
            setError(
                err.message || "Failed to change plan. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const resetPaymentState = useCallback(() => {
        setSetupIntent(null);
        setPaymentMethodId(null);
        setAppliedDiscount(null);
        setError(null);
        setCurrentStep("select-plan");
    }, []);

    const goToNextStep = async () => {
        if (currentStep === "select-plan") {
            const selectedPlan = plans.find(
                (p) => p.id === selectedPlanId,
            );
            const isPaidPlan =
                selectedPlan && selectedPlan.price_monthly > 0;

            if (isPaidPlan && !hasPaymentMethod && !paymentMethodId) {
                await createSetupIntentFn(selectedPlanId!);
                if (!error) {
                    setCurrentStep("payment");
                }
            } else {
                setCurrentStep("confirm");
            }
        } else if (currentStep === "payment") {
            setCurrentStep("confirm");
        }
    };

    const goToPreviousStep = () => {
        if (currentStep === "payment") {
            resetPaymentState();
        } else if (currentStep === "confirm") {
            const selectedPlan = plans.find(
                (p) => p.id === selectedPlanId,
            );
            const isPaidPlan =
                selectedPlan && selectedPlan.price_monthly > 0;

            if (isPaidPlan && !hasPaymentMethod) {
                setCurrentStep("payment");
            } else {
                setCurrentStep("select-plan");
            }
        }
    };

    /* ── Initialization ───────────────────────────────────────────────────── */

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            checkPaymentMethod();
            setSelectedPlanId(currentPlan?.id || null);
            setBillingPeriod(
                currentSubscription?.billing_period || "monthly",
            );
            resetPaymentState();
        }
    }, [
        isOpen,
        fetchPlans,
        checkPaymentMethod,
        currentPlan?.id,
        currentSubscription?.billing_period,
        resetPaymentState,
    ]);

    /* ── Derived state ────────────────────────────────────────────────────── */

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;
    const currentPrice =
        currentPlan && currentSubscription?.billing_period === "annual"
            ? currentPlan.price_annual
            : currentPlan?.price_monthly || 0;
    const newPrice =
        selectedPlan && billingPeriod === "annual"
            ? selectedPlan.price_annual
            : selectedPlan?.price_monthly || 0;
    const priceDifference = newPrice - currentPrice;

    const hasChanges =
        selectedPlanId !== currentPlan?.id ||
        billingPeriod !==
            (currentSubscription?.billing_period || "monthly");

    const needsPaymentForChange =
        isPaidPlan && !hasPaymentMethod && !paymentMethodId;

    /* ── Wizard steps ─────────────────────────────────────────────────────── */

    const wizardSteps = [
        { label: "Select Plan" },
        ...(needsPaymentForChange ||
        currentStep === "payment" ||
        paymentMethodId
            ? [{ label: "Payment" }]
            : []),
        { label: "Confirm" },
    ];

    const stepNumber =
        currentStep === "select-plan"
            ? 0
            : currentStep === "payment"
              ? 1
              : wizardSteps.length - 1;

    const stepTitle =
        currentStep === "select-plan"
            ? "Choose Your Plan"
            : currentStep === "payment"
              ? "Add Payment Method"
              : "Confirm Your Changes";

    if (!isOpen) return null;

    /* ── Render ───────────────────────────────────────────────────────────── */

    return (
        <ModalPortal>
            <BaselWizardModal
                isOpen={isOpen}
                onClose={onClose}
                title={stepTitle}
                icon="fa-duotone fa-regular fa-box"
                accentColor="primary"
                steps={wizardSteps}
                currentStep={stepNumber}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
                onSubmit={handleConfirm}
                submitting={submitting}
                nextDisabled={
                    !hasChanges || loading || creatingSetupIntent
                }
                nextLabel={
                    creatingSetupIntent ? "Preparing..." : "Continue"
                }
                submitLabel="Confirm & Activate"
                submittingLabel="Processing..."
                maxWidth="max-w-6xl"
                footer={
                    currentStep === "payment" && !paymentMethodId
                        ? (
                              <div className="flex justify-between w-full">
                                  <button
                                      className="btn btn-ghost"
                                      onClick={resetPaymentState}
                                      disabled={submitting}
                                  >
                                      <i className="fa-duotone fa-regular fa-arrow-left" />
                                      Back
                                  </button>
                                  <div />
                              </div>
                          )
                        : undefined
                }
            >
                {/* Error */}
                {error && (
                    <BaselAlertBox variant="error" className="mb-4">
                        {error}
                    </BaselAlertBox>
                )}

                {/* Step 1: Select Plan */}
                {currentStep === "select-plan" && (
                    <div>
                        {/* Billing toggle */}
                        <div className="flex justify-center mb-6">
                            <div className="join">
                                <button
                                    className={`join-item btn btn-sm ${
                                        billingPeriod === "monthly"
                                            ? "btn-primary"
                                            : "btn-ghost"
                                    }`}
                                    onClick={() =>
                                        setBillingPeriod("monthly")
                                    }
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`join-item btn btn-sm ${
                                        billingPeriod === "annual"
                                            ? "btn-primary"
                                            : "btn-ghost"
                                    }`}
                                    onClick={() =>
                                        setBillingPeriod("annual")
                                    }
                                >
                                    Annual
                                    <BaselStatusPill
                                        color="success"
                                        className="ml-1"
                                    >
                                        Save 20%
                                    </BaselStatusPill>
                                </button>
                            </div>
                        </div>

                        <BaselPricingCardGrid
                            plans={plans}
                            selectedPlanId={selectedPlanId}
                            onSelectPlan={(plan) =>
                                setSelectedPlanId(plan.id)
                            }
                            isAnnual={billingPeriod === "annual"}
                            loading={loading}
                        />
                    </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === "payment" &&
                    setupIntent &&
                    selectedPlan && (
                        <div className="space-y-6">
                            {/* Plan summary */}
                            <div className="bg-base-200 border border-base-300 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-lg text-base-content">
                                            {selectedPlan.name} Plan
                                        </h4>
                                        <p className="text-sm text-base-content/50">
                                            {billingPeriod === "annual"
                                                ? "Annual billing"
                                                : "Monthly billing"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-base-content">
                                            {formatPrice(
                                                newPrice,
                                                selectedPlan.currency,
                                            )}
                                        </div>
                                        <div className="text-sm text-base-content/50">
                                            per{" "}
                                            {billingPeriod === "annual"
                                                ? "year"
                                                : "month"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment form or success */}
                            {paymentMethodId ? (
                                <BaselAlertBox variant="success">
                                    <span className="font-bold">
                                        Payment method saved!
                                    </span>{" "}
                                    Click &ldquo;Continue&rdquo; to review
                                    and confirm your upgrade.
                                </BaselAlertBox>
                            ) : (
                                <StripeProvider
                                    clientSecret={
                                        setupIntent.client_secret
                                    }
                                >
                                    <PaymentForm
                                        onPaymentSuccess={(pmId) => {
                                            handlePaymentSuccess(pmId);
                                            setCurrentStep("confirm");
                                        }}
                                        onCancel={resetPaymentState}
                                        submitButtonText="Save & Continue"
                                        isProcessing={submitting}
                                        allowDiscountCode={true}
                                        planId={selectedPlan?.id}
                                        billingPeriod={billingPeriod}
                                        onDiscountApplied={
                                            setAppliedDiscount
                                        }
                                    />
                                </StripeProvider>
                            )}
                        </div>
                    )}

                {/* Step 3: Confirm */}
                {currentStep === "confirm" && selectedPlan && (
                    <div className="space-y-6">
                        <BaselReviewSection
                            title="Review Your Changes"
                            items={[
                                {
                                    label: "Plan",
                                    value: `${currentPlan?.name || "No Plan"} \u2192 ${selectedPlan.name}`,
                                },
                                {
                                    label: "Billing Period",
                                    value: `${billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)}${
                                        billingPeriod === "annual"
                                            ? " (17% savings)"
                                            : ""
                                    }`,
                                },
                                ...((paymentMethodId || hasPaymentMethod) &&
                                isPaidPlan
                                    ? [
                                          {
                                              label: "Payment Method",
                                              value: paymentMethodId
                                                  ? "New card saved"
                                                  : "Existing card on file",
                                          },
                                      ]
                                    : []),
                                ...(appliedDiscount
                                    ? [
                                          {
                                              label: "Discount Code",
                                              value: `${appliedDiscount.code}${
                                                  appliedDiscount.savings_percentage
                                                      ? ` (${appliedDiscount.savings_percentage}% off)`
                                                      : ""
                                              }`,
                                          },
                                      ]
                                    : []),
                            ]}
                            onEdit={() =>
                                setCurrentStep("select-plan")
                            }
                        />

                        {/* Price summary */}
                        <div className="bg-base-200 border border-base-300 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-base-content/50 uppercase font-bold tracking-wider">
                                        {billingPeriod === "annual"
                                            ? "Annual"
                                            : "Monthly"}{" "}
                                        Total
                                    </div>
                                    <div className="text-3xl font-black text-base-content">
                                        {formatPrice(
                                            newPrice,
                                            selectedPlan.currency,
                                        )}
                                    </div>
                                </div>
                                {priceDifference !== 0 &&
                                    currentPlan && (
                                        <div className="text-right">
                                            <div className="text-sm text-base-content/50">
                                                Change from current
                                            </div>
                                            <div
                                                className={`font-black ${
                                                    priceDifference > 0
                                                        ? "text-warning"
                                                        : "text-success"
                                                }`}
                                            >
                                                {priceDifference > 0
                                                    ? "+"
                                                    : ""}
                                                {formatPrice(
                                                    priceDifference,
                                                    selectedPlan.currency,
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        <p className="text-sm text-base-content/40 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-info-circle" />
                            Changes take effect immediately. Any price
                            difference will be prorated on your next invoice.
                        </p>
                    </div>
                )}
            </BaselWizardModal>
        </ModalPortal>
    );
}
