"use client";

/**
 * Payment Form Component
 * Stripe Elements payment form for collecting card details
 */

import { useState, FormEvent } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

export interface PaymentFormProps {
    onPaymentSuccess: (paymentMethodId: string) => void;
    onCancel?: () => void;
    submitButtonText?: string;
    isProcessing?: boolean;
}

export function PaymentForm({
    onPaymentSuccess,
    onCancel,
    submitButtonText = "Subscribe Now",
    isProcessing = false,
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [ready, setReady] = useState(false);

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
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-credit-card"></i>
                            {submitButtonText}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
