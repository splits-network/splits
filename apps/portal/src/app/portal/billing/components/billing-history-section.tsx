"use client";

/**
 * Billing History Section Component
 *
 * Displays invoice history from Stripe with status badges and download links.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

/**
 * Invoice status types from Stripe
 */
type InvoiceStatus = "paid" | "open" | "void" | "uncollectible" | "draft";

/**
 * Invoice data from Stripe
 */
interface Invoice {
    id: string;
    number: string | null;
    amount_due: number;
    amount_paid: number;
    currency: string;
    status: InvoiceStatus;
    created: string;
    invoice_pdf: string | null;
    period_start: string;
    period_end: string;
}

interface InvoicesResponse {
    invoices: Invoice[];
    has_more: boolean;
}

/**
 * Get badge class for invoice status
 */
function getStatusBadgeClass(status: InvoiceStatus): string {
    const statusClasses: Record<InvoiceStatus, string> = {
        paid: "badge-success",
        open: "badge-warning",
        void: "badge-neutral",
        uncollectible: "badge-error",
        draft: "badge-ghost",
    };
    return statusClasses[status] || "badge-neutral";
}

/**
 * Format status label
 */
function formatStatus(status: InvoiceStatus): string {
    const statusLabels: Record<InvoiceStatus, string> = {
        paid: "Paid",
        open: "Open",
        void: "Void",
        uncollectible: "Failed",
        draft: "Draft",
    };
    return (
        statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)
    );
}

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
}

/**
 * Format date from ISO string
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Get billing period description
 */
function getBillingPeriod(periodStart: string, periodEnd: string): string {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const startMonth = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const endMonth = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return `${startMonth} - ${endMonth}`;
}

export default function BillingHistorySection() {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(10);

    /**
     * Fetch invoices from Stripe
     */
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

                const response = await client.get<{ data: InvoicesResponse }>(
                    `/subscriptions/invoices?limit=${currentLimit}`,
                );

                setInvoices(response.data.invoices);
                setHasMore(response.data.has_more);

                if (loadMore) {
                    setLimit(currentLimit);
                }
            } catch (err: any) {
                console.error("Failed to fetch invoices:", err);
                // If no subscription exists, show empty state
                if (
                    err.message?.includes("No subscription") ||
                    err.message?.includes("No customer")
                ) {
                    setInvoices([]);
                    setHasMore(false);
                } else {
                    setError(err.message || "Failed to load billing history");
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [getToken, limit],
    );

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    /**
     * Load more invoices
     */
    const handleLoadMore = () => {
        fetchInvoices(true);
    };

    // Loading state
    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-receipt"></i>
                        Billing History
                    </h2>
                    <div className="divider my-2"></div>
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                        <span className="ml-3 text-base-content/70">
                            Loading invoices...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-receipt"></i>
                    Billing History
                </h2>
                <div className="divider my-2"></div>

                {/* Error message */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => fetchInvoices()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {invoices.length === 0 && !error ? (
                    <div className="text-center py-8 text-base-content/70">
                        <i className="fa-duotone fa-regular fa-file-invoice text-4xl mb-3 block"></i>
                        <p className="font-medium">No Billing History</p>
                        <p className="text-sm">
                            Your invoices will appear here once you have an
                            active subscription.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Invoice table */}
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="whitespace-nowrap">
                                                {formatDate(invoice.created)}
                                            </td>
                                            <td>
                                                <div>
                                                    <span className="font-medium">
                                                        {invoice.number ||
                                                            "Invoice"}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    {getBillingPeriod(
                                                        invoice.period_start,
                                                        invoice.period_end,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="font-medium">
                                                {formatAmount(
                                                    invoice.status === "paid"
                                                        ? invoice.amount_paid
                                                        : invoice.amount_due,
                                                    invoice.currency,
                                                )}
                                            </td>
                                            <td>
                                                <div
                                                    className={`badge ${getStatusBadgeClass(invoice.status)}`}
                                                >
                                                    {formatStatus(
                                                        invoice.status,
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {invoice.invoice_pdf ? (
                                                    <a
                                                        href={
                                                            invoice.invoice_pdf
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-xs btn-ghost"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-download"></i>
                                                        PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-base-content/40 text-xs">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Load more button */}
                        {hasMore && (
                            <div className="text-center mt-4">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-chevron-down"></i>
                                            Load More
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
