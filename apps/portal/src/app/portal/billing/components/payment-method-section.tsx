"use client";

/**
 * Payment Method Section Component
 *
 * Displays current payment method from Stripe and allows updates.
 * States: Loading, Has payment method, No payment method
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StripeProvider, PaymentForm } from "@/components/stripe";

/**
 * Payment method details from Stripe
 */
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

/**
 * Get card brand icon class
 */
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

/**
 * Capitalize card brand name
 */
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

export default function PaymentMethodSection() {
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

    /**
     * Fetch current payment method from Stripe
     */
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
            // If no subscription/customer exists yet, show "no payment method" state
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

    /**
     * Create SetupIntent for Stripe Elements
     */
    const handleOpenUpdateModal = async () => {
        try {
            setCreating(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            // Use a placeholder plan_id - backend will use customer's current plan
            const response = await client.post<{ data: SetupIntentResponse }>(
                "/subscriptions/setup-intent",
                {
                    plan_id: "update-payment-method",
                },
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

    /**
     * Handle successful payment method update
     */
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

            // Refresh payment method display
            await fetchPaymentMethod();

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            console.error("Failed to update payment method:", err);
            setError(err.message || "Failed to save payment method");
        }
    };

    /**
     * Close modal and reset state
     */
    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setSetupIntent(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-wallet"></i>
                        Payment Method
                    </h2>
                    <div className="divider my-2"></div>
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                        <span className="ml-3 text-base-content/70">
                            Loading payment method...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const hasPaymentMethod =
        paymentMethod?.has_payment_method &&
        paymentMethod?.default_payment_method;
    const card = paymentMethod?.default_payment_method;

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-wallet"></i>
                    Payment Method
                </h2>
                <div className="divider my-2"></div>

                {/* Success message */}
                {successMessage && (
                    <div className="alert alert-success mb-4">
                        <i className="fa-duotone fa-regular fa-check-circle"></i>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Payment method display */}
                {hasPaymentMethod && card ? (
                    <div className="p-4 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">
                                <i className={getCardBrandIcon(card.brand)}></i>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">
                                    {formatCardBrand(card.brand)} ••••{" "}
                                    {card.last4}
                                </div>
                                <div className="text-sm text-base-content/70">
                                    Expires{" "}
                                    {card.exp_month.toString().padStart(2, "0")}
                                    /{card.exp_year}
                                </div>
                            </div>
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={handleOpenUpdateModal}
                                disabled={creating}
                            >
                                {creating ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-pen"></i>
                                )}
                                Update
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="alert alert-warning">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            <div>
                                <div className="font-semibold">
                                    No Payment Method on File
                                </div>
                                <div className="text-sm">
                                    Add a payment method to ensure uninterrupted
                                    access to your subscription.
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary mt-4"
                            onClick={handleOpenUpdateModal}
                            disabled={creating}
                        >
                            {creating ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-plus"></i>
                                    Add Payment Method
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* Update Payment Method Modal */}
            {showUpdateModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-md">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>

                        <h3 className="font-bold text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-credit-card mr-2"></i>
                            {hasPaymentMethod
                                ? "Update Payment Method"
                                : "Add Payment Method"}
                        </h3>

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
                                <span className="loading loading-spinner loading-md"></span>
                                <span className="ml-3">Initializing...</span>
                            </div>
                        )}
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={handleCloseModal}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
}
