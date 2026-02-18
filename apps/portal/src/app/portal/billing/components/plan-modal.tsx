"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    Modal,
    BillingToggle,
    StepProgress,
    Button,
    AlertBanner,
    Badge,
    SettingsField,
} from "@splits-network/memphis-ui";
import { PricingCardGrid } from "@/components/pricing/pricing-card-grid";
import type { Plan } from "@/components/pricing/types";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { ButtonLoading, ModalPortal } from "@splits-network/shared-ui";

type BillingPeriod = "monthly" | "annual";

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

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSubscription: Subscription | null;
    currentPlan: Plan | null;
    onPlanChanged: () => void;
}

function formatPrice(amount: number, currency: string = "usd"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

type WizardStep = "select-plan" | "payment" | "confirm";

export default function PlanModal({
    isOpen,
    onClose,
    currentSubscription,
    currentPlan,
    onPlanChanged,
}: PlanModalProps) {
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
    const [setupIntent, setSetupIntent] = useState<SetupIntentResponse | null>(
        null,
    );
    const [creatingSetupIntent, setCreatingSetupIntent] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState<WizardStep>("select-plan");

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
            const response = await client.get<{ data: PaymentMethodResponse }>(
                "/subscriptions/payment-methods",
            );
            setHasPaymentMethod(response.data?.has_payment_method ?? false);
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
                if (isPaidPlan && paymentMethodId && setupIntent?.customer_id) {
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
            setError(err.message || "Failed to change plan. Please try again.");
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
            const selectedPlan = plans.find((p) => p.id === selectedPlanId);
            const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;

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
            const selectedPlan = plans.find((p) => p.id === selectedPlanId);
            const isPaidPlan = selectedPlan && selectedPlan.price_monthly > 0;

            if (isPaidPlan && !hasPaymentMethod) {
                setCurrentStep("payment");
            } else {
                setCurrentStep("select-plan");
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            checkPaymentMethod();
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

    const needsPaymentForChange =
        isPaidPlan && !hasPaymentMethod && !paymentMethodId;

    const stepItems = [
        { label: "Select Plan", icon: "fa-duotone fa-regular fa-box", accent: "coral" as const },
        ...(needsPaymentForChange ||
        currentStep === "payment" ||
        paymentMethodId
            ? [{ label: "Payment", icon: "fa-duotone fa-regular fa-credit-card", accent: "teal" as const }]
            : []),
        { label: "Confirm", icon: "fa-duotone fa-regular fa-check", accent: "purple" as const },
    ];

    const stepNumber =
        currentStep === "select-plan"
            ? 0
            : currentStep === "payment"
              ? 1
              : stepItems.length - 1;

    if (!isOpen) return null;

    return (
        <ModalPortal>
        <Modal
            open={isOpen}
            onClose={onClose}
            title={
                currentStep === "select-plan"
                    ? "Choose Your Plan"
                    : currentStep === "payment"
                      ? "Add Payment Method"
                      : "Confirm Your Changes"
            }
            maxWidth="max-w-6xl"
        >
            {/* Step Progress */}
            <StepProgress steps={stepItems} currentStep={stepNumber} />

            {/* Error */}
            {error && (
                <AlertBanner type="error" className="mt-4">
                    {error}
                </AlertBanner>
            )}

            {/* Step 1: Select Plan */}
            {currentStep === "select-plan" && (
                <div className="mt-6">
                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-6">
                        <BillingToggle
                            annual={billingPeriod === "annual"}
                            onChange={(annual) =>
                                setBillingPeriod(
                                    annual ? "annual" : "monthly",
                                )
                            }
                        />
                    </div>

                    {/* Plans Grid — identical cards to /public/pricing */}
                    <PricingCardGrid
                        plans={plans}
                        selectedPlanId={selectedPlanId}
                        onSelectPlan={(plan) => setSelectedPlanId(plan.id)}
                        isAnnual={billingPeriod === "annual"}
                        loading={loading}
                    />
                </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === "payment" && setupIntent && selectedPlan && (
                <div className="mt-6 space-y-6">
                    {/* Plan Summary */}
                    <div className="border-4 border-purple/30 bg-cream p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-black text-lg text-dark">
                                    {selectedPlan.name} Plan
                                </h4>
                                <p className="text-sm text-dark/50">
                                    {billingPeriod === "annual"
                                        ? "Annual billing"
                                        : "Monthly billing"}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-dark">
                                    {formatPrice(
                                        newPrice,
                                        selectedPlan.currency,
                                    )}
                                </div>
                                <div className="text-sm text-dark/50">
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
                        <AlertBanner type="success">
                            <span className="font-bold">
                                Payment method saved!
                            </span>{" "}
                            Click &ldquo;Continue&rdquo; to review and confirm
                            your upgrade.
                        </AlertBanner>
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
                <div className="mt-6">
                    <div className="border-4 border-teal/30 bg-cream p-6 space-y-0">
                        <h4 className="font-black text-lg text-dark mb-4 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-clipboard-check text-teal" />
                            Review Your Changes
                        </h4>

                        <SettingsField label="Plan">
                            <span className="text-sm font-bold text-dark">
                                {currentPlan?.name || "No Plan"} &rarr;{" "}
                                {selectedPlan.name}
                            </span>
                        </SettingsField>

                        <SettingsField label="Billing Period">
                            <span className="text-sm font-bold text-dark capitalize">
                                {billingPeriod}
                            </span>
                            {billingPeriod === "annual" && (
                                <Badge
                                    color="teal"
                                    size="sm"
                                    className="ml-2"
                                >
                                    17% Savings
                                </Badge>
                            )}
                        </SettingsField>

                        {(paymentMethodId || hasPaymentMethod) &&
                            isPaidPlan && (
                                <SettingsField label="Payment Method">
                                    <span className="text-sm font-bold text-dark flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-credit-card text-teal" />
                                        {paymentMethodId
                                            ? "New card saved"
                                            : "Existing card on file"}
                                    </span>
                                </SettingsField>
                            )}

                        {appliedDiscount && (
                            <SettingsField label="Discount Code">
                                <span className="text-sm font-bold text-teal flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-tag" />
                                    {appliedDiscount.code}
                                    {appliedDiscount.savings_percentage && (
                                        <span>
                                            {" "}
                                            ({appliedDiscount.savings_percentage}
                                            % off)
                                        </span>
                                    )}
                                </span>
                            </SettingsField>
                        )}

                        <div className="pt-4 border-t-4 border-cream mt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-dark/50 uppercase font-bold tracking-wider">
                                        {billingPeriod === "annual"
                                            ? "Annual"
                                            : "Monthly"}{" "}
                                        Total
                                    </div>
                                    <div className="text-3xl font-black text-dark">
                                        {formatPrice(
                                            newPrice,
                                            selectedPlan.currency,
                                        )}
                                    </div>
                                </div>
                                {priceDifference !== 0 && currentPlan && (
                                    <div className="text-right">
                                        <div className="text-sm text-dark/50">
                                            Change from current
                                        </div>
                                        <div
                                            className={`font-black ${priceDifference > 0 ? "text-yellow" : "text-teal"}`}
                                        >
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

                        <p className="text-sm text-dark/40 mt-4 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-info-circle" />
                            Changes take effect immediately. Any price difference
                            will be prorated on your next invoice.
                        </p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
                {currentStep === "select-plan" && (
                    <>
                        <Button
                            color="dark"
                            variant="ghost"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="coral"
                            onClick={goToNextStep}
                            disabled={
                                !hasChanges || loading || creatingSetupIntent
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
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                                </>
                            )}
                        </Button>
                    </>
                )}

                {currentStep === "payment" && (
                    <>
                        <Button
                            color="dark"
                            variant="ghost"
                            onClick={resetPaymentState}
                            disabled={submitting}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left mr-1" />
                            Back
                        </Button>
                        {paymentMethodId && (
                            <Button
                                color="coral"
                                onClick={() => setCurrentStep("confirm")}
                            >
                                Continue
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                            </Button>
                        )}
                    </>
                )}

                {currentStep === "confirm" && (
                    <>
                        <Button
                            color="dark"
                            variant="ghost"
                            onClick={goToPreviousStep}
                            disabled={submitting}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left mr-1" />
                            Back
                        </Button>
                        <Button
                            color="coral"
                            onClick={handleConfirm}
                            disabled={submitting}
                        >
                            <ButtonLoading
                                loading={submitting}
                                icon="fa-duotone fa-regular fa-check"
                                text="Confirm & Activate"
                                loadingText="Processing..."
                            />
                        </Button>
                    </>
                )}
            </div>
        </Modal>
        </ModalPortal>
    );
}
