"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { CompanyPaymentForm } from "./company-payment-form";

interface PaymentMethodDetails {
    id: string;
    type: string;
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
    bank_name?: string;
    account_type?: string;
    display_label: string;
}

interface PaymentMethodResponse {
    has_payment_method: boolean;
    default_payment_method: PaymentMethodDetails | null;
}

function getPaymentMethodIcon(pm: PaymentMethodDetails): string {
    if (pm.type === "card" && pm.brand) {
        const brandIcons: Record<string, string> = {
            visa: "fa-brands fa-cc-visa",
            mastercard: "fa-brands fa-cc-mastercard",
            amex: "fa-brands fa-cc-amex",
            discover: "fa-brands fa-cc-discover",
            diners: "fa-brands fa-cc-diners-club",
            jcb: "fa-brands fa-cc-jcb",
        };
        return (
            brandIcons[pm.brand.toLowerCase()] ||
            "fa-duotone fa-regular fa-credit-card"
        );
    }
    if (pm.type === "us_bank_account") {
        return "fa-duotone fa-regular fa-building-columns";
    }
    if (pm.type === "sepa_debit") {
        return "fa-duotone fa-regular fa-building-columns";
    }
    if (pm.type === "link") {
        return "fa-duotone fa-regular fa-link";
    }
    return "fa-duotone fa-regular fa-wallet";
}

function getPaymentMethodSubtext(pm: PaymentMethodDetails): string {
    if (pm.type === "card" && pm.exp_month && pm.exp_year) {
        return `Expires ${pm.exp_month.toString().padStart(2, "0")}/${pm.exp_year}`;
    }
    if (pm.type === "us_bank_account" && pm.account_type) {
        return (
            pm.account_type.charAt(0).toUpperCase() +
            pm.account_type.slice(1) +
            " account"
        );
    }
    if (pm.type === "sepa_debit") {
        return "SEPA Direct Debit";
    }
    if (pm.type === "link") {
        return "Stripe Link";
    }
    return "";
}

interface CompanyPaymentMethodSectionProps {
    companyId: string;
    billingTerms?: string;
    onPaymentMethodUpdated?: () => void;
}

export default function CompanyPaymentMethodSection({
    companyId,
    billingTerms,
    onPaymentMethodUpdated,
}: CompanyPaymentMethodSectionProps) {
    const { getToken } = useAuth();
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchPaymentMethod = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: PaymentMethodResponse }>(
                `/company-billing-profiles/${companyId}/payment-method`,
            );
            setPaymentMethod(response.data);
        } catch (err: any) {
            console.error("Failed to fetch company payment method:", err);
            setPaymentMethod({
                has_payment_method: false,
                default_payment_method: null,
            });
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        fetchPaymentMethod();
    }, [fetchPaymentMethod]);

    const handlePaymentSuccess = async () => {
        setDrawerOpen(false);
        setSuccessMessage("Payment method updated successfully");

        await fetchPaymentMethod();
        onPaymentMethodUpdated?.();

        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    if (loading) {
        return (
            <>
                <h2 className="">
                    <i className="fa-duotone fa-regular fa-wallet"></i>
                    Payment Method
                </h2>
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md"></span>
                    <span className="ml-3 text-base-content/70">
                        Loading payment method...
                    </span>
                </div>
            </>
        );
    }

    const hasPaymentMethod =
        paymentMethod?.has_payment_method &&
        paymentMethod?.default_payment_method;
    const pm = paymentMethod?.default_payment_method;

    return (
        <div className="drawer drawer-end">
            <input
                id="payment-method-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={drawerOpen}
                readOnly
            />
            <div className="drawer-content">
                <h2 className="mb-2">
                    <i className="fa-duotone fa-regular fa-wallet mr-2"></i>
                    Payment Method
                </h2>

                {successMessage && (
                    <div className="alert alert-success mb-4">
                        <i className="fa-duotone fa-regular fa-check-circle"></i>
                        <span>{successMessage}</span>
                    </div>
                )}

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

                {hasPaymentMethod && pm ? (
                    <div className="p-4 bg-base-100 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">
                                <i className={getPaymentMethodIcon(pm)}></i>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">
                                    {pm.display_label}
                                </div>
                                {getPaymentMethodSubtext(pm) && (
                                    <div className="text-sm text-base-content/70">
                                        {getPaymentMethodSubtext(pm)}
                                    </div>
                                )}
                            </div>
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => setDrawerOpen(true)}
                            >
                                <i className="fa-duotone fa-regular fa-pen"></i>
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
                                    {billingTerms === "immediate"
                                        ? "Placement fees cannot be charged until a payment method is added."
                                        : "A payment method ensures invoices are paid on time."}
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <i className="fa-duotone fa-regular fa-plus"></i>
                            Add Payment Method
                        </button>
                    </>
                )}
            </div>
            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={handleCloseDrawer}
                ></label>
                <div className="bg-base-100 min-h-full w-full max-w-md flex flex-col">
                    <div className="sticky top-0 bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-wallet"></i>
                            {hasPaymentMethod
                                ? "Update Payment Method"
                                : "Add Payment Method"}
                        </h3>
                        <button
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={handleCloseDrawer}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {drawerOpen && (
                            <CompanyPaymentForm
                                companyId={companyId}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handleCloseDrawer}
                                submitButtonText={
                                    hasPaymentMethod
                                        ? "Update Payment Method"
                                        : "Add Payment Method"
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
