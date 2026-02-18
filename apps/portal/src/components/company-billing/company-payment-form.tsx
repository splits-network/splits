"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button, AlertBanner } from "@splits-network/memphis-ui";
import { StripeProvider, PaymentForm } from "@/components/stripe";

interface CompanyPaymentFormProps {
    companyId: string;
    onSuccess: () => void;
    onCancel?: () => void;
    allowSkip?: boolean;
    onSkip?: () => void;
    submitButtonText?: string;
}

export function CompanyPaymentForm({
    companyId,
    onSuccess,
    onCancel,
    allowSkip,
    onSkip,
    submitButtonText = "Save Payment Method",
}: CompanyPaymentFormProps) {
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
                <span className="ml-3 text-sm text-dark/50">
                    Initializing payment form...
                </span>
            </div>
        );
    }

    if (error && !clientSecret) {
        return (
            <div className="space-y-4">
                <AlertBanner type="error">
                    {error}
                    <Button
                        color="coral"
                        size="sm"
                        onClick={createSetupIntent}
                        className="ml-2"
                    >
                        Retry
                    </Button>
                </AlertBanner>
                <div className="flex items-center justify-between">
                    {allowSkip && onSkip && (
                        <Button variant="ghost" size="sm" onClick={onSkip}>
                            Skip for now
                        </Button>
                    )}
                    {onCancel && (
                        <Button variant="ghost" onClick={onCancel}>
                            <i className="fa-duotone fa-regular fa-arrow-left mr-1" />
                            Back
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && <AlertBanner type="error">{error}</AlertBanner>}

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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkip}
                        disabled={saving}
                    >
                        Skip for now
                    </Button>
                </div>
            )}

            <p className="text-sm text-dark/40 flex items-center gap-1">
                <i className="fa-duotone fa-regular fa-lock" />
                Your payment details are collected and stored securely by
                Stripe. Splits Network never sees or stores your account
                details.
            </p>
        </div>
    );
}
