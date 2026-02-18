"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button, AlertBanner } from "@splits-network/memphis-ui";
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
    if (pm.type === "us_bank_account")
        return "fa-duotone fa-regular fa-building-columns";
    if (pm.type === "sepa_debit")
        return "fa-duotone fa-regular fa-building-columns";
    if (pm.type === "link") return "fa-duotone fa-regular fa-link";
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
    if (pm.type === "sepa_debit") return "SEPA Direct Debit";
    if (pm.type === "link") return "Stripe Link";
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
            <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md" />
                <span className="ml-3 text-sm text-dark/50">
                    Loading payment method...
                </span>
            </div>
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
                {successMessage && (
                    <AlertBanner type="success" className="mb-4">
                        {successMessage}
                    </AlertBanner>
                )}

                {error && (
                    <AlertBanner
                        type="error"
                        className="mb-4"
                        onDismiss={() => setError(null)}
                    >
                        {error}
                    </AlertBanner>
                )}

                {hasPaymentMethod && pm ? (
                    <div className="border-4 border-dark/10 bg-white p-4">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl text-dark">
                                <i className={getPaymentMethodIcon(pm)} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-dark">
                                    {pm.display_label}
                                </div>
                                {getPaymentMethodSubtext(pm) && (
                                    <div className="text-sm text-dark/50">
                                        {getPaymentMethodSubtext(pm)}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDrawerOpen(true)}
                            >
                                <i className="fa-duotone fa-regular fa-pen mr-1" />
                                Update
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <AlertBanner type="warning">
                            <div>
                                <div className="font-bold">
                                    No Payment Method on File
                                </div>
                                <div className="text-sm">
                                    {billingTerms === "immediate"
                                        ? "Placement fees cannot be charged until a payment method is added."
                                        : "A payment method ensures invoices are paid on time."}
                                </div>
                            </div>
                        </AlertBanner>

                        <Button
                            color="coral"
                            className="mt-4"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <i className="fa-duotone fa-regular fa-plus mr-1" />
                            Add Payment Method
                        </Button>
                    </>
                )}
            </div>
            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={handleCloseDrawer}
                />
                <div className="bg-white min-h-full w-full max-w-md flex flex-col">
                    <div className="sticky top-0 bg-white border-b-4 border-dark px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="font-black text-lg uppercase tracking-wider text-dark flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-wallet" />
                            {hasPaymentMethod
                                ? "Update Payment"
                                : "Add Payment"}
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCloseDrawer}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </Button>
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
