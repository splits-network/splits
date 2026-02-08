"use client";

/**
 * Payment Form Component
 * Stripe Elements payment form for collecting card details
 */

import { useState, FormEvent, useEffect, useCallback } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

interface DiscountInfo {
    id: string;
    code: string;
    valid: boolean;
    discount_type: "percentage" | "amount";
    value: number;
    duration: "once" | "repeating" | "forever";
    duration_in_months?: number;
    savings_amount?: number;
    savings_percentage?: number;
}

export interface PaymentFormProps {
    onPaymentSuccess: (paymentMethodId: string) => void;
    onCancel?: () => void;
    submitButtonText?: string;
    isProcessing?: boolean;
    allowDiscountCode?: boolean;
    planId?: string;
    billingPeriod?: "monthly" | "annual";
    onDiscountApplied?: (discount: DiscountInfo) => void;
}

export function PaymentForm({
    onPaymentSuccess,
    onCancel,
    submitButtonText = "Subscribe Now",
    isProcessing = false,
    allowDiscountCode = false,
    planId,
    billingPeriod = "monthly",
    onDiscountApplied,
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { getToken } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [ready, setReady] = useState(false);

    // Discount code state
    const [discountCode, setDiscountCode] = useState("");
    const [discountValidating, setDiscountValidating] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(
        null,
    );
    const [discountError, setDiscountError] = useState<string | null>(null);

    // Debounced discount validation (300ms)
    const validateDiscountCode = useCallback(
        async (code: string) => {
            if (!code.trim() || !planId) return;

            setDiscountValidating(true);
            setDiscountError(null);

            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response = await client.post("/discounts/validate", {
                    code: code.trim(),
                    plan_id: planId,
                    billing_period: billingPeriod,
                });

                if (response.data.valid && response.data.discount) {
                    setAppliedDiscount(response.data.discount);
                    onDiscountApplied?.(response.data.discount);
                    setDiscountError(null);
                } else {
                    setAppliedDiscount(null);
                    setDiscountError(
                        response.data.error?.message || "Invalid discount code",
                    );
                }
            } catch (err: any) {
                console.error("Discount validation failed:", err);
                setAppliedDiscount(null);
                setDiscountError(
                    "Unable to validate discount code. Please try again.",
                );
            } finally {
                setDiscountValidating(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [planId, billingPeriod, onDiscountApplied],
    );

    // Debounced validation effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (discountCode.trim()) {
                validateDiscountCode(discountCode);
            } else {
                setAppliedDiscount(null);
                setDiscountError(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [discountCode, validateDiscountCode]);

    const removeDiscount = () => {
        setDiscountCode("");
        setAppliedDiscount(null);
        setDiscountError(null);
        onDiscountApplied?.(null as any);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError("Payment system is not ready. Please try again.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Confirm the SetupIntent to save the payment method
            const { error: confirmError, setupIntent } =
                await stripe.confirmSetup({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/onboarding/callback`,
                    },
                    redirect: "if_required",
                });

            if (confirmError) {
                setError(
                    confirmError.message ||
                        "An error occurred while processing your payment method.",
                );
                setProcessing(false);
                return;
            }

            if (setupIntent && setupIntent.payment_method) {
                // Payment method was successfully saved
                onPaymentSuccess(setupIntent.payment_method as string);
            } else {
                setError("Unable to save payment method. Please try again.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    const isSubmitting = processing || isProcessing;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Element */}
            <div className="p-4 bg-base-100 rounded-lg border border-base-300">
                <PaymentElement
                    onReady={() => setReady(true)}
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {/* Discount Code Section */}
            {allowDiscountCode && (
                <div className="space-y-3">
                    {!appliedDiscount ? (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Discount Code (Optional)
                            </legend>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={discountCode}
                                    onChange={(e) =>
                                        setDiscountCode(e.target.value)
                                    }
                                    placeholder="Enter discount code"
                                    disabled={
                                        discountValidating ||
                                        processing ||
                                        isProcessing
                                    }
                                />
                                {discountValidating && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm"></span>
                                    </div>
                                )}
                            </div>
                            {discountError && (
                                <div className="alert alert-info mt-2">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <span className="text-sm">
                                        {discountError}
                                    </span>
                                </div>
                            )}
                        </fieldset>
                    ) : (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-badge-percent text-success text-lg"></i>
                                    <div>
                                        <div className="font-semibold text-success">
                                            Discount Applied:{" "}
                                            {appliedDiscount.code}
                                        </div>
                                        <div className="text-sm text-base-content/70">
                                            Save $
                                            {(appliedDiscount.savings_amount ||
                                                0) / 100}
                                            (
                                            {appliedDiscount.savings_percentage}
                                            %)
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-ghost btn-circle"
                                    onClick={removeDiscount}
                                    disabled={processing || isProcessing}
                                    title="Remove discount"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Security Note */}
            <div className="flex items-center gap-2 text-sm text-base-content/70">
                <i className="fa-duotone fa-regular fa-lock text-success"></i>
                <span>
                    Your payment information is securely processed by Stripe
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-between">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn"
                        disabled={isSubmitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        Back
                    </button>
                )}
                <button
                    type="submit"
                    className={`btn btn-primary ${onCancel ? "" : "btn-block"}`}
                    disabled={!stripe || !elements || !ready || isSubmitting}
                >
                    <ButtonLoading
                        loading={isSubmitting}
                        text={submitButtonText}
                        loadingText="Processing..."
                        icon="fa-duotone fa-regular fa-credit-card"
                    />
                </button>
            </div>
        </form>
    );
}
