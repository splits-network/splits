"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselAlertBox,
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
} from "@splits-network/basel-ui";
import { StripeProvider, PaymentForm } from "@/components/stripe";
import { getCardBrandIcon, formatCardBrand } from "./billing-utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface PaymentMethodDetails {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
}

interface PaymentMethodResponse {
    has_payment_method: boolean;
    default_payment_method: PaymentMethodDetails | null;
}

interface SetupIntentResponse {
    client_secret: string;
    customer_id: string;
    plan_id: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PaymentSection() {
    const { getToken } = useAuth();
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [setupIntent, setSetupIntent] =
        useState<SetupIntentResponse | null>(null);
    const [creating, setCreating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchPaymentMethod = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{
                data: PaymentMethodResponse;
            }>("/subscriptions/payment-methods");
            setPaymentMethod(response.data);
        } catch (err: any) {
            console.error("Failed to fetch payment method:", err);
            if (
                err.message?.includes("No subscription") ||
                err.message?.includes("No customer")
            ) {
                setPaymentMethod({
                    has_payment_method: false,
                    default_payment_method: null,
                });
            } else {
                setError(err.message || "Failed to load payment method");
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPaymentMethod();
    }, [fetchPaymentMethod]);

    const handleOpenUpdateModal = async () => {
        try {
            setCreating(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.post<{
                data: SetupIntentResponse;
            }>("/subscriptions/setup-intent", {
                plan_id: "update-payment-method",
            });

            setSetupIntent(response.data);
            setShowUpdateModal(true);
        } catch (err: any) {
            console.error("Failed to create setup intent:", err);
            setError(err.message || "Failed to initialize payment form");
        } finally {
            setCreating(false);
        }
    };

    const handlePaymentSuccess = async (paymentMethodId: string) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post("/subscriptions/update-payment-method", {
                payment_method_id: paymentMethodId,
            });

            setShowUpdateModal(false);
            setSetupIntent(null);
            setSuccessMessage("Payment method updated successfully");

            await fetchPaymentMethod();

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            console.error("Failed to update payment method:", err);
            setError(err.message || "Failed to save payment method");
        }
    };

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setSetupIntent(null);
    };

    /* ── Loading ──────────────────────────────────────────────────────────── */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    const hasPaymentMethod =
        paymentMethod?.has_payment_method &&
        paymentMethod?.default_payment_method;
    const card = paymentMethod?.default_payment_method;

    /* ── Render ───────────────────────────────────────────────────────────── */

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Payment Methods
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your payment method for subscription billing.
            </p>

            {/* Success message */}
            {successMessage && (
                <BaselAlertBox variant="success" className="mb-6">
                    {successMessage}
                </BaselAlertBox>
            )}

            {/* Error message */}
            {error && (
                <BaselAlertBox variant="error" className="mb-6">
                    {error}
                    <button
                        className="btn btn-ghost btn-xs ml-2"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </BaselAlertBox>
            )}

            {hasPaymentMethod && card ? (
                <div className="bg-base-200 border border-base-300 p-5">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl text-primary">
                            <i className={getCardBrandIcon(card.brand)} />
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-base-content">
                                {formatCardBrand(card.brand)}{" "}
                                &#x2022;&#x2022;&#x2022;&#x2022; {card.last4}
                            </div>
                            <div className="text-sm text-base-content/50">
                                Expires{" "}
                                {card.exp_month.toString().padStart(2, "0")}/
                                {card.exp_year}
                            </div>
                        </div>
                        <button
                            className="btn btn-sm btn-outline btn-primary"
                            onClick={handleOpenUpdateModal}
                            disabled={creating}
                        >
                            {creating ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-pen" />
                            )}
                            Update
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <BaselAlertBox variant="warning">
                        <span className="font-bold">
                            No Payment Method on File
                        </span>
                        <br />
                        Add a payment method to ensure uninterrupted access to
                        your subscription.
                    </BaselAlertBox>

                    <button
                        className="btn btn-primary mt-4"
                        onClick={handleOpenUpdateModal}
                        disabled={creating}
                    >
                        {creating ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Preparing...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-plus" />
                                Add Payment Method
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Update Payment Method Modal */}
            <BaselModal
                isOpen={showUpdateModal}
                onClose={handleCloseModal}
                maxWidth="max-w-md"
            >
                <BaselModalHeader
                    title={
                        hasPaymentMethod
                            ? "Update Payment Method"
                            : "Add Payment Method"
                    }
                    icon="fa-duotone fa-regular fa-credit-card"
                    onClose={handleCloseModal}
                />
                <BaselModalBody>
                    {setupIntent?.client_secret ? (
                        <StripeProvider
                            clientSecret={setupIntent.client_secret}
                        >
                            <PaymentForm
                                onPaymentSuccess={handlePaymentSuccess}
                                onCancel={handleCloseModal}
                                submitButtonText={
                                    hasPaymentMethod
                                        ? "Update Card"
                                        : "Add Card"
                                }
                            />
                        </StripeProvider>
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <span className="loading loading-spinner loading-md" />
                            <span className="ml-3 text-sm text-base-content/50">
                                Initializing...
                            </span>
                        </div>
                    )}
                </BaselModalBody>
            </BaselModal>
        </div>
    );
}
