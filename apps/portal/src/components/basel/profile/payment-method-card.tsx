"use client";

import { useState } from "react";
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

interface PaymentMethodCardProps {
    paymentMethod: PaymentMethodDetails | null;
    hasPaymentMethod: boolean;
    loading: boolean;
    onRefresh: () => void;
}

interface SetupIntentResponse {
    client_secret: string;
    customer_id: string;
    plan_id: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PaymentMethodCard({
    paymentMethod,
    hasPaymentMethod,
    loading,
    onRefresh,
}: PaymentMethodCardProps) {
    const { getToken } = useAuth();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [setupIntent, setSetupIntent] = useState<SetupIntentResponse | null>(null);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleOpenUpdateModal = async () => {
        try {
            setCreating(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: SetupIntentResponse }>(
                "/subscriptions/setup-intent",
                { plan_id: "update-payment-method" },
            );

            setSetupIntent(response.data);
            setShowUpdateModal(true);
        } catch (err: any) {
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
            onRefresh();
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            setError(err.message || "Failed to save payment method");
        }
    };

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setSetupIntent(null);
    };

    if (loading) {
        return (
            <div className="bg-base-200 border border-base-300 p-6 flex items-center justify-center">
                <span className="loading loading-spinner loading-sm" />
            </div>
        );
    }

    const card = paymentMethod;

    return (
        <>
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary p-6">
                <h4 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-3">
                    Payment Method
                </h4>

                {successMessage && (
                    <BaselAlertBox variant="success" className="mb-4">
                        {successMessage}
                    </BaselAlertBox>
                )}

                {error && (
                    <BaselAlertBox variant="error" className="mb-4">
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
                    <div className="flex items-center gap-4">
                        <div className="text-3xl text-primary">
                            <i className={getCardBrandIcon(card.brand)} />
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-base-content">
                                {formatCardBrand(card.brand)} &#x2022;&#x2022;&#x2022;&#x2022; {card.last4}
                            </div>
                            <div className="text-sm text-base-content/50">
                                Expires {card.exp_month.toString().padStart(2, "0")}/{card.exp_year}
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
                ) : (
                    <div>
                        <p className="text-sm text-base-content/50 mb-3">
                            No payment method on file. Add one to ensure uninterrupted access.
                        </p>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleOpenUpdateModal}
                            disabled={creating}
                        >
                            {creating ? (
                                <>
                                    <span className="loading loading-spinner loading-xs" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-plus" />
                                    Add Payment Method
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Update Payment Method Modal */}
            <BaselModal
                isOpen={showUpdateModal}
                onClose={handleCloseModal}
                maxWidth="max-w-md"
            >
                <BaselModalHeader
                    title={hasPaymentMethod ? "Update Payment Method" : "Add Payment Method"}
                    icon="fa-duotone fa-regular fa-credit-card"
                    onClose={handleCloseModal}
                />
                <BaselModalBody>
                    {setupIntent?.client_secret ? (
                        <StripeProvider clientSecret={setupIntent.client_secret}>
                            <PaymentForm
                                onPaymentSuccess={handlePaymentSuccess}
                                onCancel={handleCloseModal}
                                submitButtonText={hasPaymentMethod ? "Update Card" : "Add Card"}
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
        </>
    );
}
