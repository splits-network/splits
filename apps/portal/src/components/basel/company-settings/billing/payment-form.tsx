"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StripeProvider, PaymentForm } from "@/components/stripe";

interface BaselPaymentFormProps {
    companyId: string;
    onSuccess: () => void;
    onCancel?: () => void;
    allowSkip?: boolean;
    onSkip?: () => void;
    submitButtonText?: string;
}

export function BaselPaymentForm({
    companyId,
    onSuccess,
    onCancel,
    allowSkip,
    onSkip,
    submitButtonText = "Save Payment Method",
}: BaselPaymentFormProps) {
    const { getToken } = useAuth();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const createSetupIntent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.post<{
                data: { client_secret: string; customer_id: string };
            }>(`/company-billing-profiles/${companyId}/setup-intent`);

            setClientSecret(response.data.client_secret);
        } catch (err: any) {
            console.error("Failed to create setup intent:", err);
            setError(err.message || "Failed to initialize payment form");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        createSetupIntent();
    }, [createSetupIntent]);

    const handlePaymentSuccess = async (paymentMethodId: string) => {
        try {
            setSaving(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post(
                `/company-billing-profiles/${companyId}/payment-method`,
                { payment_method_id: paymentMethodId },
            );

            onSuccess();
        } catch (err: any) {
            console.error("Failed to save payment method:", err);
            setError(err.message || "Failed to save payment method");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md" />
                <span className="ml-3 text-sm text-base-content/40">
                    Initializing payment form...
                </span>
            </div>
        );
    }

    if (error && !clientSecret) {
        return (
            <div className="space-y-4">
                <div className="bg-error/5 border border-error/20 p-4">
                    <p className="text-sm font-semibold text-error">
                        {error}
                    </p>
                    <button
                        className="btn btn-sm btn-error btn-outline mt-2"
                        onClick={createSetupIntent}
                    >
                        Retry
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    {allowSkip && onSkip && (
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={onSkip}
                        >
                            Skip for now
                        </button>
                    )}
                    {onCancel && (
                        <button className="btn btn-ghost" onClick={onCancel}>
                            <i className="fa-duotone fa-regular fa-arrow-left mr-1" />
                            Back
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-error/5 border border-error/20 p-4">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}

            {clientSecret && (
                <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                        onPaymentSuccess={handlePaymentSuccess}
                        onCancel={onCancel}
                        submitButtonText={submitButtonText}
                        isProcessing={saving}
                    />
                </StripeProvider>
            )}

            {allowSkip && onSkip && (
                <div className="flex justify-start">
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={onSkip}
                        disabled={saving}
                    >
                        Skip for now
                    </button>
                </div>
            )}

            <p className="text-xs text-base-content/30 flex items-center gap-1">
                <i className="fa-duotone fa-regular fa-lock" />
                Your payment details are collected and stored securely by
                Stripe. Splits Network never sees or stores your account
                details.
            </p>
        </div>
    );
}
