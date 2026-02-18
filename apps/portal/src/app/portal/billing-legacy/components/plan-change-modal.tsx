"use client";

/**
 * Plan Change Modal Component
 *
 * Allows recruiters to upgrade/downgrade their subscription plan
 * and switch between monthly/annual billing periods.
 * Includes seamless payment collection for paid plan upgrades.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { ModalLoadingOverlay, ButtonLoading } from "@splits-network/shared-ui";

type BillingPeriod = "monthly" | "annual";
type PlanTier = "starter" | "pro" | "partner";
type PlanStatus = "active" | "archived";

interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: PlanTier;
    description: string | null;
    price_monthly: number;
    price_annual: number;
    currency: string;
    features: Record<string, any>;
    status: PlanStatus;
    stripe_price_id_monthly: string | null;
    stripe_price_id_annual: string | null;
    is_active: boolean;
}

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

interface PlanChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSubscription: Subscription | null;
    currentPlan: Plan | null;
    onPlanChanged: () => void;
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
 * Get features list from plan
 */
function getPlanFeatures(plan: Plan): string[] {
    if (!plan?.features) return [];

    // Check for 'included' array (current schema)
    if (Array.isArray(plan.features.included)) {
        return plan.features.included;
    }

    // Fallback: Check for 'list' array
    if (Array.isArray(plan.features.list)) {
        return plan.features.list;
    }

    // Fallback: Convert object with boolean values
    if (typeof plan.features === "object") {
        return Object.entries(plan.features)
            .filter(([, enabled]) => enabled === true)
            .map(([feature]) =>
                feature
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
            );
    }

    return [];
}

/**
 * Get tier badge color
 */
function getTierBadgeClass(tier: PlanTier): string {
    const classes: Record<PlanTier, string> = {
        starter: "badge-neutral",
        pro: "badge-primary",
        partner: "badge-secondary",
    };
    return classes[tier] || "badge-neutral";
}

/**
 * Plan Card Component - Full pricing card with all plan details
 */
function PlanCard({
    plan,
    isCurrentPlan,
    isSelected,
    billingPeriod,
    onSelect,
}: {
    plan: Plan;
    isCurrentPlan: boolean;
    isSelected: boolean;
    billingPeriod: BillingPeriod;
    onSelect: () => void;
}) {
    const price =
        billingPeriod === "annual" ? plan.price_annual : plan.price_monthly;
    const monthlyEquivalent =
        billingPeriod === "annual"
            ? Math.round(plan.price_annual / 12)
            : plan.price_monthly;

    const includedFeatures = getPlanFeatures(plan);
    const notIncludedFeatures: string[] = plan.features?.not_included || [];
    const headline = plan.features?.headline || "";
    const subheadline = plan.features?.subheadline || "";
    const label = plan.features?.label || null; // e.g., "MOST POPULAR"
    const footnote = plan.features?.footnote || null;

    return (
        <div
            className={`card bg-base-100 border-2 cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected
                    ? "border-coral shadow-lg"
                    : isCurrentPlan
                      ? "border-success/50"
                      : "border-base-300"
            }`}
            onClick={onSelect}
        >
            {/* Popular badge */}
            {label && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-primary badge-sm font-semibold">
                        {label}
                    </span>
                </div>
            )}

            <div className="card-body p-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    <div className="flex gap-1">
                        {isCurrentPlan && (
                            <span className="badge badge-success badge-sm">
                                Current
                            </span>
                        )}
                        <span
                            className={`badge badge-sm ${getTierBadgeClass(plan.tier)}`}
                        >
                            {plan.tier.charAt(0).toUpperCase() +
                                plan.tier.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Headline */}
                {headline && (
                    <p className="text-sm font-medium text-base-content mt-1">
                        {headline}
                    </p>
                )}

                {/* Price */}
                <div className="mt-3">
                    <span className="text-3xl font-bold">
                        {formatPrice(price, plan.currency)}
                    </span>
                    <span className="text-base-content/70">
                        /{billingPeriod === "annual" ? "year" : "month"}
                    </span>
                    {billingPeriod === "annual" && (
                        <div className="text-sm text-base-content/60">
                            ({formatPrice(monthlyEquivalent, plan.currency)}
                            /month)
                        </div>
                    )}
                </div>

                {/* Subheadline */}
                {subheadline && (
                    <p className="text-sm text-base-content/70 mt-2">
                        {subheadline}
                    </p>
                )}

                {/* Divider */}
                <div className="divider my-2"></div>

                {/* Included Features */}
                <div className="space-y-2">
                    {includedFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                        >
                            <i className="fa-duotone fa-regular fa-check text-success text-xs mt-1 shrink-0"></i>
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Not Included Features */}
                {notIncludedFeatures.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {notIncludedFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 text-sm text-base-content/50"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-base-content/40 text-xs mt-1 shrink-0"></i>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footnote */}
                {footnote && (
                    <p className="text-xs text-base-content/50 mt-3 italic">
                        {footnote}
                    </p>
                )}

                {/* Selection indicator */}
                <div className="mt-4 flex justify-center">
                    <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                                ? "border-coral bg-primary"
                                : "border-base-300 hover:border-base-content/50"
                        }`}
                    >
                        {isSelected && (
                            <i className="fa-duotone fa-regular fa-check text-primary-content text-xs"></i>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PlanChangeModal({
    isOpen,
    onClose,
    currentSubscription,
    currentPlan,
    onPlanChanged,
}: PlanChangeModalProps) {
    const { getToken } = useAuth();

    // State
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

    // Payment collection state
    const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean | null>(
        null,
    );
    const [needsPaymentCollection, setNeedsPaymentCollection] = useState(false);
    const [setupIntent, setSetupIntent] = useState<SetupIntentResponse | null>(
        null,
    );
    const [creatingSetupIntent, setCreatingSetupIntent] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

    // Discount state
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

    // Wizard step state
    type WizardStep = "select-plan" | "payment" | "confirm";
    const [currentStep, setCurrentStep] = useState<WizardStep>("select-plan");

    /**
     * Fetch available plans
     */
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

            // Filter to only active plans and sort by price
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

    /**
     * Check if user has a payment method set up
     */
    const checkPaymentMethod = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: PaymentMethodResponse }>(
                "/subscriptions/payment-methods",
            );
            setHasPaymentMethod(response.data?.has_payment_method ?? false);
        } catch (err: any) {
            console.error("Failed to check payment method:", err);
            // Assume no payment method if check fails
            setHasPaymentMethod(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Create a SetupIntent for collecting payment
     */
    const createSetupIntent = useCallback(
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
                setNeedsPaymentCollection(true);
            } catch (err: any) {
                console.error("Failed to create setup intent:", err);
                setError(err.message || "Failed to initialize payment form");
            } finally {
                setCreatingSetupIntent(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    /**
     * Handle successful payment method collection
     */
    const handlePaymentSuccess = (newPaymentMethodId: string) => {
        setPaymentMethodId(newPaymentMethodId);
        setHasPaymentMethod(true);
        // Don't close payment form yet - wait for confirm
    };

    /**
     * Handle plan change/subscription creation
     */
    const handleConfirm = async () => {
        if (!selectedPlanId) return;

        const selectedPlan = plans.find((p) => p.id === selectedPlanId);
        const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;

        // If paid plan and no payment method, need to collect payment first
        if (isPaidPlan && !hasPaymentMethod && !paymentMethodId) {
            await createSetupIntent(selectedPlanId);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const client = createAuthenticatedClient(token);

            if (currentSubscription) {
                // Update existing subscription
                const updateData: Record<string, any> = {
                    plan_id: selectedPlanId,
                    billing_period: billingPeriod,
                };

                // Add promotion code if discount was applied
                if (appliedDiscount?.code) {
                    updateData.promotion_code = appliedDiscount.code;
                }

                await client.patch(
                    `/subscriptions/${currentSubscription.id}`,
                    updateData,
                );
            } else {
                // Create new subscription
                // For paid plans, include payment method and customer ID
                const activateData: Record<string, any> = {
                    plan_id: selectedPlanId,
                    billing_period: billingPeriod,
                };

                if (isPaidPlan && paymentMethodId && setupIntent?.customer_id) {
                    activateData.payment_method_id = paymentMethodId;
                    activateData.customer_id = setupIntent.customer_id;
                }

                // Add promotion code if discount was applied
                if (appliedDiscount?.code) {
                    activateData.promotion_code = appliedDiscount.code;
                }

                await client.post("/subscriptions/activate", activateData);
            }

            onPlanChanged();
            onClose();
        } catch (err: any) {
            console.error("Failed to change plan:", err);
            setError(err.message || "Failed to change plan. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Reset payment state when modal closes or going back
     */
    const resetPaymentState = useCallback(() => {
        setNeedsPaymentCollection(false);
        setSetupIntent(null);
        setPaymentMethodId(null);
        setAppliedDiscount(null);
        setError(null);
        setCurrentStep("select-plan");
    }, []);

    /**
     * Navigate to next step in wizard
     */
    const goToNextStep = async () => {
        if (currentStep === "select-plan") {
            const selectedPlan = plans.find((p) => p.id === selectedPlanId);
            const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;

            // If paid plan and no payment method, go to payment step
            if (isPaidPlan && !hasPaymentMethod && !paymentMethodId) {
                await createSetupIntent(selectedPlanId!);
                if (!error) {
                    setCurrentStep("payment");
                }
            } else {
                // Skip to confirm step
                setCurrentStep("confirm");
            }
        } else if (currentStep === "payment") {
            setCurrentStep("confirm");
        }
    };

    /**
     * Navigate to previous step in wizard
     */
    const goToPreviousStep = () => {
        if (currentStep === "payment") {
            resetPaymentState();
        } else if (currentStep === "confirm") {
            const selectedPlan = plans.find((p) => p.id === selectedPlanId);
            const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;

            // Go back to payment if it was a paid plan upgrade, else go to select
            if (isPaidPlan && !hasPaymentMethod) {
                setCurrentStep("payment");
            } else {
                setCurrentStep("select-plan");
            }
        }
    };

    // Fetch plans and check payment method when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            checkPaymentMethod();
            // Reset selection to current plan
            setSelectedPlanId(currentPlan?.id || null);
            setBillingPeriod(currentSubscription?.billing_period || "monthly");
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

    // Calculate price difference for preview
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
        billingPeriod !== (currentSubscription?.billing_period || "monthly");

    // Determine if we need payment for this change
    const needsPaymentForChange =
        isPaidPlan && !hasPaymentMethod && !paymentMethodId;

    if (!isOpen) return null;

    // Determine wizard step count based on whether payment is needed
    const totalSteps =
        needsPaymentForChange ||
        currentStep === "payment" ||
        currentStep === "confirm"
            ? 3
            : 2;
    const stepNumber =
        currentStep === "select-plan"
            ? 1
            : currentStep === "payment"
              ? 2
              : needsPaymentForChange || paymentMethodId
                ? 3
                : 2;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square mr-2"></i>
                        {currentStep === "select-plan" && "Choose Your Plan"}
                        {currentStep === "payment" && "Add Payment Method"}
                        {currentStep === "confirm" && "Confirm Your Changes"}
                    </h3>
                    <button
                        className="btn btn-sm btn-square btn-ghost"
                        onClick={onClose}
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    </button>
                </div>

                {/* Wizard Steps Indicator */}
                <ul className="steps steps-horizontal w-full mb-6">
                    <li
                        className={`step ${currentStep === "select-plan" || currentStep === "payment" || currentStep === "confirm" ? "step-primary" : ""}`}
                    >
                        <span className="text-xs">Select Plan</span>
                    </li>
                    {(needsPaymentForChange ||
                        currentStep === "payment" ||
                        paymentMethodId) && (
                        <li
                            className={`step ${currentStep === "payment" || currentStep === "confirm" ? "step-primary" : ""}`}
                        >
                            <span className="text-xs">Payment</span>
                        </li>
                    )}
                    <li
                        className={`step ${currentStep === "confirm" ? "step-primary" : ""}`}
                    >
                        <span className="text-xs">Confirm</span>
                    </li>
                </ul>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: Select Plan */}
                {currentStep === "select-plan" && (
                    <ModalLoadingOverlay loading={loading}>
                        {/* Billing Period Toggle */}
                        <div className="flex justify-center mb-6">
                            <div className="join">
                                <button
                                    className={`join-item btn ${billingPeriod === "monthly" ? "btn-active" : ""}`}
                                    onClick={() => setBillingPeriod("monthly")}
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`join-item btn ${billingPeriod === "annual" ? "btn-active" : ""}`}
                                    onClick={() => setBillingPeriod("annual")}
                                >
                                    Annual
                                    <span className="badge badge-success ml-2">
                                        Save 17%
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Plans Grid */}
                        {plans.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {plans.map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        isCurrentPlan={
                                            plan.id === currentPlan?.id
                                        }
                                        isSelected={plan.id === selectedPlanId}
                                        billingPeriod={billingPeriod}
                                        onSelect={() =>
                                            setSelectedPlanId(plan.id)
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {/* No Plans State */}
                        {plans.length === 0 && !loading && (
                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-info-circle"></i>
                                <span>No plans available at this time.</span>
                            </div>
                        )}
                    </ModalLoadingOverlay>
                )}

                {/* Step 2: Payment */}
                {currentStep === "payment" && setupIntent && selectedPlan && (
                    <div className="py-4">
                        {/* Plan Summary */}
                        <div className="bg-base-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg">
                                        {selectedPlan.name} Plan
                                    </h4>
                                    <p className="text-sm text-base-content/70">
                                        {billingPeriod === "annual"
                                            ? "Annual billing"
                                            : "Monthly billing"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">
                                        {formatPrice(
                                            newPrice,
                                            selectedPlan.currency,
                                        )}
                                    </div>
                                    <div className="text-sm text-base-content/70">
                                        per{" "}
                                        {billingPeriod === "annual"
                                            ? "year"
                                            : "month"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        {paymentMethodId ? (
                            <div className="alert alert-success">
                                <i className="fa-duotone fa-regular fa-circle-check"></i>
                                <div>
                                    <h4 className="font-semibold">
                                        Payment method saved!
                                    </h4>
                                    <p className="text-sm">
                                        Click "Continue" to review and confirm
                                        your upgrade.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <StripeProvider
                                clientSecret={setupIntent.client_secret}
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
                                    onDiscountApplied={setAppliedDiscount}
                                />
                            </StripeProvider>
                        )}
                    </div>
                )}

                {/* Step 3: Confirm */}
                {currentStep === "confirm" && selectedPlan && (
                    <div className="py-4">
                        <div className="bg-base-200 rounded-lg p-6">
                            <h4 className="font-semibold text-lg mb-4">
                                <i className="fa-duotone fa-regular fa-clipboard-check mr-2"></i>
                                Review Your Changes
                            </h4>

                            <div className="space-y-4">
                                {/* Plan Change */}
                                <div className="flex items-center justify-between py-3 border-b border-base-300">
                                    <div>
                                        <div className="text-sm text-base-content/70">
                                            Plan
                                        </div>
                                        <div className="font-medium">
                                            {currentPlan?.name || "No Plan"} →{" "}
                                            {selectedPlan.name}
                                        </div>
                                    </div>
                                    <div className="badge badge-primary">
                                        {selectedPlan.tier
                                            .charAt(0)
                                            .toUpperCase() +
                                            selectedPlan.tier.slice(1)}
                                    </div>
                                </div>

                                {/* Billing Period */}
                                <div className="flex items-center justify-between py-3 border-b border-base-300">
                                    <div>
                                        <div className="text-sm text-base-content/70">
                                            Billing Period
                                        </div>
                                        <div className="font-medium capitalize">
                                            {billingPeriod}
                                        </div>
                                    </div>
                                    {billingPeriod === "annual" && (
                                        <span className="badge badge-success">
                                            17% Savings
                                        </span>
                                    )}
                                </div>

                                {/* Payment Method */}
                                {(paymentMethodId || hasPaymentMethod) &&
                                    isPaidPlan && (
                                        <div className="flex items-center justify-between py-3 border-b border-base-300">
                                            <div>
                                                <div className="text-sm text-base-content/70">
                                                    Payment Method
                                                </div>
                                                <div className="font-medium">
                                                    <i className="fa-duotone fa-regular fa-credit-card mr-2"></i>
                                                    {paymentMethodId
                                                        ? "New card saved"
                                                        : "Existing card on file"}
                                                </div>
                                            </div>
                                            <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                                        </div>
                                    )}

                                {/* Discount */}
                                {appliedDiscount && (
                                    <div className="flex items-center justify-between py-3 border-b border-base-300">
                                        <div>
                                            <div className="text-sm text-base-content/70">
                                                Discount Code
                                            </div>
                                            <div className="font-medium">
                                                <i className="fa-duotone fa-regular fa-tag mr-2"></i>
                                                {appliedDiscount.code}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-success">
                                                Save{" "}
                                                {appliedDiscount.savings_amount
                                                    ? `$${appliedDiscount.savings_amount}`
                                                    : ""}
                                            </div>
                                            {appliedDiscount.savings_percentage && (
                                                <div className="text-xs text-success">
                                                    (
                                                    {
                                                        appliedDiscount.savings_percentage
                                                    }
                                                    % off)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="text-sm text-base-content/70">
                                            {billingPeriod === "annual"
                                                ? "Annual"
                                                : "Monthly"}{" "}
                                            Total
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {formatPrice(
                                                newPrice,
                                                selectedPlan.currency,
                                            )}
                                        </div>
                                    </div>
                                    {priceDifference !== 0 && currentPlan && (
                                        <div
                                            className={`text-right ${priceDifference > 0 ? "text-warning" : "text-success"}`}
                                        >
                                            <div className="text-sm">
                                                Change from current
                                            </div>
                                            <div className="font-semibold">
                                                {priceDifference > 0 ? "+" : ""}
                                                {formatPrice(
                                                    priceDifference,
                                                    selectedPlan.currency,
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-base-content/60">
                                <i className="fa-duotone fa-regular fa-info-circle mr-1"></i>
                                Changes take effect immediately. Any price
                                difference will be prorated on your next
                                invoice.
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="modal-action">
                    {currentStep === "select-plan" && (
                        <>
                            <button className="btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={goToNextStep}
                                disabled={
                                    !hasChanges ||
                                    loading ||
                                    creatingSetupIntent
                                }
                            >
                                {creatingSetupIntent ? (
                                    <ButtonLoading
                                        loading={true}
                                        text="Continue"
                                        loadingText="Preparing..."
                                    />
                                ) : (
                                    <>
                                        Continue
                                        <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {currentStep === "payment" && (
                        <>
                            <button
                                className="btn"
                                onClick={resetPaymentState}
                                disabled={submitting}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left mr-1"></i>
                                Back
                            </button>
                            {paymentMethodId && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setCurrentStep("confirm")}
                                >
                                    Continue
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                </button>
                            )}
                        </>
                    )}

                    {currentStep === "confirm" && (
                        <>
                            <button
                                className="btn"
                                onClick={goToPreviousStep}
                                disabled={submitting}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left mr-1"></i>
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                disabled={submitting}
                            >
                                <ButtonLoading
                                    loading={submitting}
                                    icon="fa-duotone fa-regular fa-check"
                                    text="Confirm & Activate"
                                    loadingText="Processing..."
                                />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
