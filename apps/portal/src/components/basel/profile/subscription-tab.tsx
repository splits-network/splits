"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselAlertBox,
    BaselEmptyState,
    BaselStatusPill,
} from "@splits-network/basel-ui";
import { BaselPlanModal } from "./basel-plan-modal";
import { PlanCard } from "./plan-card";
import { PaymentMethodCard } from "./payment-method-card";
import {
    invoiceStatusColor,
    formatInvoiceStatus,
    formatAmount,
    formatDateShort,
    getBillingPeriod,
} from "./billing-utils";
import type { Plan } from "@/components/pricing/types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type SubscriptionStatus =
    | "active"
    | "past_due"
    | "canceled"
    | "trialing"
    | "incomplete";

interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    status: SubscriptionStatus;
    billing_period?: "monthly" | "annual";
    current_period_start: string;
    current_period_end: string | null;
    trial_start: string | null;
    trial_end: string | null;
    cancel_at: string | null;
    canceled_at: string | null;
    created_at: string;
    updated_at: string;
    plan?: Plan;
}

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

interface Invoice {
    id: string;
    number: string | null;
    amount_due: number;
    amount_paid: number;
    currency: string;
    status: string;
    created: string;
    invoice_pdf: string | null;
    period_start: string;
    period_end: string;
}

interface InvoicesResponse {
    invoices: Invoice[];
    has_more: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function SubscriptionTab() {
    const { getToken } = useAuth();

    // Subscription state
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [subLoading, setSubLoading] = useState(true);
    const [subError, setSubError] = useState<string | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);

    // Payment method state
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodResponse | null>(null);
    const [pmLoading, setPmLoading] = useState(true);

    // Invoice state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [invLoading, setInvLoading] = useState(true);
    const [invError, setInvError] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [limit, setLimit] = useState(10);

    /* ── Fetchers ─────────────────────────────────────────────────────────── */

    const fetchSubscription = useCallback(async () => {
        try {
            setSubLoading(true);
            setSubError(null);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: Subscription }>(
                "/subscriptions/me",
            );
            const data = response.data;
            setSubscription(data);
            if (data?.plan) setPlan(data.plan);
        } catch (err: any) {
            if (
                err.message?.includes("No active subscription") ||
                err.message?.includes("not found")
            ) {
                setSubscription(null);
            } else {
                setSubError(err.message || "Failed to load subscription");
            }
        } finally {
            setSubLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPaymentMethod = useCallback(async () => {
        try {
            setPmLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: PaymentMethodResponse }>(
                "/subscriptions/payment-methods",
            );
            setPaymentMethod(response.data);
        } catch (err: any) {
            if (
                err.message?.includes("No subscription") ||
                err.message?.includes("No customer")
            ) {
                setPaymentMethod({
                    has_payment_method: false,
                    default_payment_method: null,
                });
            }
        } finally {
            setPmLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInvoices = useCallback(
        async (loadMore = false) => {
            try {
                if (loadMore) {
                    setLoadingMore(true);
                } else {
                    setInvLoading(true);
                }
                setInvError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const currentLimit = loadMore ? limit + 10 : limit;
                const response = await client.get<{ data: InvoicesResponse }>(
                    `/subscriptions/invoices?limit=${currentLimit}`,
                );
                setInvoices(response.data.invoices);
                setHasMore(response.data.has_more);
                if (loadMore) setLimit(currentLimit);
            } catch (err: any) {
                if (
                    err.message?.includes("No subscription") ||
                    err.message?.includes("No customer")
                ) {
                    setInvoices([]);
                    setHasMore(false);
                } else {
                    setInvError(
                        err.message || "Failed to load billing history",
                    );
                }
            } finally {
                setInvLoading(false);
                setLoadingMore(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [limit],
    );

    useEffect(() => {
        fetchSubscription();
        fetchPaymentMethod();
        fetchInvoices();
    }, [fetchSubscription, fetchPaymentMethod, fetchInvoices]);

    /* ── Loading ──────────────────────────────────────────────────────────── */

    if (subLoading && pmLoading && invLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    /* ── Render ───────────────────────────────────────────────────────────── */

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Subscription
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Your plan, payment method, and billing history — all in one
                place.
            </p>

            {subError && (
                <BaselAlertBox variant="error" className="mb-6">
                    {subError}
                    <button
                        className="btn btn-ghost btn-sm ml-2"
                        onClick={fetchSubscription}
                    >
                        Retry
                    </button>
                </BaselAlertBox>
            )}

            {/* ── No subscription empty state ────────────────────────────── */}
            {!subLoading && !subscription && !subError && (
                <>
                    <BaselEmptyState
                        icon="fa-duotone fa-regular fa-box"
                        title="No Active Subscription"
                        description="Subscribe to a plan to access all recruiter features."
                        actions={[
                            {
                                label: "View Plans",
                                style: "btn-primary",
                                onClick: () => setShowPlanModal(true),
                            },
                        ]}
                    />
                    {showPlanModal && (
                        <BaselPlanModal
                            isOpen={showPlanModal}
                            onClose={() => setShowPlanModal(false)}
                            currentSubscription={null}
                            currentPlan={null}
                            onPlanChanged={() => {
                                setShowPlanModal(false);
                                fetchSubscription();
                                fetchPaymentMethod();
                                fetchInvoices();
                            }}
                        />
                    )}
                </>
            )}

            {/* ── 60/40 editorial layout ─────────────────────────────────── */}
            {subscription && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
                        {/* Left: Plan card (60%) */}
                        <div className="lg:col-span-3">
                            {plan ? (
                                <PlanCard
                                    subscription={subscription}
                                    plan={plan}
                                    onManagePlan={() => setShowPlanModal(true)}
                                />
                            ) : (
                                <BaselEmptyState
                                    icon="fa-duotone fa-regular fa-box"
                                    title="No Plan Selected"
                                    description="Your subscription is active but no plan is assigned."
                                    actions={[
                                        {
                                            label: "Select a Plan",
                                            style: "btn-primary",
                                            onClick: () =>
                                                setShowPlanModal(true),
                                        },
                                    ]}
                                />
                            )}
                        </div>

                        {/* Right: Payment method (40%) */}
                        <div className="lg:col-span-2">
                            <PaymentMethodCard
                                paymentMethod={
                                    paymentMethod?.default_payment_method ||
                                    null
                                }
                                hasPaymentMethod={
                                    !!paymentMethod?.has_payment_method &&
                                    !!paymentMethod?.default_payment_method
                                }
                                loading={pmLoading}
                                onRefresh={fetchPaymentMethod}
                            />
                        </div>
                    </div>

                    {/* ── Inline invoice history ─────────────────────────────── */}
                    <div>
                        <h3 className="text-lg font-black tracking-tight mb-1">
                            Invoice History
                        </h3>
                        <p className="text-sm text-base-content/50 mb-4">
                            View and download your past invoices.
                        </p>

                        {invError && (
                            <BaselAlertBox variant="error" className="mb-4">
                                {invError}
                                <button
                                    className="btn btn-ghost btn-sm ml-2"
                                    onClick={() => fetchInvoices()}
                                >
                                    Retry
                                </button>
                            </BaselAlertBox>
                        )}

                        {invLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <span className="loading loading-spinner loading-sm" />
                            </div>
                        ) : invoices.length === 0 && !invError ? (
                            <div className="bg-base-200 border border-base-300 p-6 text-center">
                                <i className="fa-duotone fa-regular fa-file-invoice text-2xl text-base-content/20 mb-2" />
                                <p className="text-sm text-base-content/50">
                                    Your invoices will appear here once you have
                                    billing activity.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-base-300 text-base-content">
                                                <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                                    Invoice
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((invoice, i) => (
                                                <tr
                                                    key={invoice.id}
                                                    className={`border-b border-base-300 ${
                                                        i % 2 === 0
                                                            ? "bg-base-100"
                                                            : "bg-base-200/50"
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 text-sm font-bold text-base-content whitespace-nowrap">
                                                        {formatDateShort(
                                                            invoice.created,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-bold text-base-content">
                                                            {invoice.number ||
                                                                "Invoice"}
                                                        </div>
                                                        <div className="text-sm text-base-content/50">
                                                            {getBillingPeriod(
                                                                invoice.period_start,
                                                                invoice.period_end,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-black text-base-content">
                                                        {formatAmount(
                                                            invoice.status ===
                                                                "paid"
                                                                ? invoice.amount_paid
                                                                : invoice.amount_due,
                                                            invoice.currency,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <BaselStatusPill
                                                            color={invoiceStatusColor(
                                                                invoice.status,
                                                            )}
                                                        >
                                                            {formatInvoiceStatus(
                                                                invoice.status,
                                                            )}
                                                        </BaselStatusPill>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {invoice.invoice_pdf ? (
                                                            <a
                                                                href={
                                                                    invoice.invoice_pdf
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-bold text-primary hover:text-primary/70 flex items-center gap-1"
                                                            >
                                                                <i className="fa-duotone fa-regular fa-download" />
                                                                PDF
                                                            </a>
                                                        ) : (
                                                            <span className="text-base-content/30 text-sm">
                                                                {"\u2014"}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {hasMore && (
                                    <div className="text-center mt-4">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => fetchInvoices(true)}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <span className="loading loading-spinner loading-xs" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-duotone fa-regular fa-chevron-down" />
                                                    Load More
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {showPlanModal && (
                        <BaselPlanModal
                            isOpen={showPlanModal}
                            onClose={() => setShowPlanModal(false)}
                            currentSubscription={subscription}
                            currentPlan={plan}
                            onPlanChanged={() => {
                                setShowPlanModal(false);
                                fetchSubscription();
                                fetchPaymentMethod();
                                fetchInvoices();
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
