"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselAlertBox, BaselEmptyState, BaselStatusPill } from "@splits-network/basel-ui";
import {
    invoiceStatusColor,
    formatInvoiceStatus,
    formatAmount,
    formatDateShort,
    getBillingPeriod,
} from "./billing-utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

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

export function HistorySection() {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(10);

    const fetchInvoices = useCallback(
        async (loadMore = false) => {
            try {
                if (loadMore) {
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                }
                setError(null);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const currentLimit = loadMore ? limit + 10 : limit;

                const response = await client.get<{
                    data: InvoicesResponse;
                }>(`/subscriptions/invoices?limit=${currentLimit}`);

                setInvoices(response.data.invoices);
                setHasMore(response.data.has_more);

                if (loadMore) {
                    setLimit(currentLimit);
                }
            } catch (err: any) {
                console.error("Failed to fetch invoices:", err);
                if (
                    err.message?.includes("No subscription") ||
                    err.message?.includes("No customer")
                ) {
                    setInvoices([]);
                    setHasMore(false);
                } else {
                    setError(
                        err.message || "Failed to load billing history",
                    );
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [limit],
    );

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    /* ── Loading ──────────────────────────────────────────────────────────── */

    if (loading) {
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
                Invoice History
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                View and download your past invoices.
            </p>

            {/* Error */}
            {error && (
                <BaselAlertBox variant="error" className="mb-6">
                    {error}
                    <button
                        className="btn btn-ghost btn-sm ml-2"
                        onClick={() => fetchInvoices()}
                    >
                        Retry
                    </button>
                </BaselAlertBox>
            )}

            {/* Empty state */}
            {invoices.length === 0 && !error ? (
                <BaselEmptyState
                    icon="fa-duotone fa-regular fa-file-invoice"
                    title="No Billing History"
                    description="Your invoices will appear here once you have an active subscription."
                />
            ) : (
                <>
                    {/* Invoice table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral text-neutral-content">
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
                                            {formatDateShort(invoice.created)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-bold text-base-content">
                                                {invoice.number || "Invoice"}
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
                                                invoice.status === "paid"
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
                                                    href={invoice.invoice_pdf}
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

                    {/* Load more */}
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
    );
}
