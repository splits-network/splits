"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    DetailSection,
    Badge,
    Button,
    Modal,
    AlertBanner,
} from "@splits-network/memphis-ui";
import { StripeProvider, PaymentForm } from "@/components/stripe";

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

function getCardBrandIcon(brand: string): string {
    const brandIcons: Record<string, string> = {
        visa: "fa-brands fa-cc-visa",
        mastercard: "fa-brands fa-cc-mastercard",
        amex: "fa-brands fa-cc-amex",
        discover: "fa-brands fa-cc-discover",
        diners: "fa-brands fa-cc-diners-club",
        jcb: "fa-brands fa-cc-jcb",
        stripe: "fa-brands fa-cc-stripe",
    };
    return (
        brandIcons[brand.toLowerCase()] ||
        "fa-duotone fa-regular fa-credit-card"
    );
}

function formatCardBrand(brand: string): string {
    const brandNames: Record<string, string> = {
        visa: "Visa",
        mastercard: "Mastercard",
        amex: "American Express",
        discover: "Discover",
        diners: "Diners Club",
        jcb: "JCB",
    };
    return (
        brandNames[brand.toLowerCase()] ||
        brand.charAt(0).toUpperCase() + brand.slice(1)
    );
}

export default function PaymentSection() {
    const { getToken } = useAuth();
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [setupIntent, setSetupIntent] = useState<SetupIntentResponse | null>(
        null,
    );
    const [creating, setCreating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchPaymentMethod = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: PaymentMethodResponse }>(
                "/subscriptions/payment-methods",
            );
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
            const response = await client.post<{ data: SetupIntentResponse }>(
                "/subscriptions/setup-intent",
                { plan_id: "update-payment-method" },
            );

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

    if (loading) {
        return (
            <DetailSection
                title="Payment Method"
                icon="fa-duotone fa-regular fa-wallet"
                accent="teal"
            >
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md" />
                    <span className="ml-3 text-sm text-dark/50">
                        Loading payment method...
                    </span>
                </div>
            </DetailSection>
        );
    }

    const hasPaymentMethod =
        paymentMethod?.has_payment_method &&
        paymentMethod?.default_payment_method;
    const card = paymentMethod?.default_payment_method;

    return (
        <>
            <DetailSection
                title="Payment Method"
                icon="fa-duotone fa-regular fa-wallet"
                accent="teal"
            >
                {/* Success message */}
                {successMessage && (
                    <AlertBanner type="success" className="mb-4">
                        {successMessage}
                    </AlertBanner>
                )}

                {/* Error message */}
                {error && (
                    <AlertBanner
                        type="error"
                        className="mb-4"
                        onDismiss={() => setError(null)}
                    >
                        {error}
                    </AlertBanner>
                )}

                {hasPaymentMethod && card ? (
                    <div className="border-4 border-teal/30 bg-cream p-4">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl text-teal">
                                <i className={getCardBrandIcon(card.brand)} />
                            </div>
                            <div className="flex-1">
                                <div className="font-black text-dark">
                                    {formatCardBrand(card.brand)} &#x2022;&#x2022;&#x2022;&#x2022;{" "}
                                    {card.last4}
                                </div>
                                <div className="text-sm text-dark/50">
                                    Expires{" "}
                                    {card.exp_month.toString().padStart(2, "0")}
                                    /{card.exp_year}
                                </div>
                            </div>
                            <Button
                                color="teal"
                                variant="outline"
                                size="sm"
                                onClick={handleOpenUpdateModal}
                                disabled={creating}
                            >
                                {creating ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-pen mr-1" />
                                )}
                                Update
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <AlertBanner type="warning">
                            <span className="font-bold">
                                No Payment Method on File
                            </span>
                            <br />
                            Add a payment method to ensure uninterrupted access
                            to your subscription.
                        </AlertBanner>

                        <Button
                            color="teal"
                            className="mt-4"
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
                                    <i className="fa-duotone fa-regular fa-plus mr-1" />
                                    Add Payment Method
                                </>
                            )}
                        </Button>
                    </>
                )}
            </DetailSection>

            {/* Update Payment Method Modal */}
            <Modal
                open={showUpdateModal}
                onClose={handleCloseModal}
                title={
                    hasPaymentMethod
                        ? "Update Payment Method"
                        : "Add Payment Method"
                }
                maxWidth="max-w-md"
            >
                {setupIntent?.client_secret ? (
                    <StripeProvider clientSecret={setupIntent.client_secret}>
                        <PaymentForm
                            onPaymentSuccess={handlePaymentSuccess}
                            onCancel={handleCloseModal}
                            submitButtonText={
                                hasPaymentMethod ? "Update Card" : "Add Card"
                            }
                        />
                    </StripeProvider>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md" />
                        <span className="ml-3 text-sm text-dark/50">
                            Initializing...
                        </span>
                    </div>
                )}
            </Modal>
        </>
    );
}
