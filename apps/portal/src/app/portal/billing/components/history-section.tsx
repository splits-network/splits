"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    DetailSection,
    Badge,
    Button,
    AlertBanner,
    EmptyState,
} from "@splits-network/memphis-ui";
import { invoiceStatusVariant } from "./accent";

type InvoiceStatus = "paid" | "open" | "void" | "uncollectible" | "draft";

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

function formatStatus(status: InvoiceStatus): string {
    const labels: Record<InvoiceStatus, string> = {
        paid: "Paid",
        open: "Open",
        void: "Void",
        uncollectible: "Failed",
        draft: "Draft",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

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

    return `${startMonth} \u2013 ${endMonth}`;
}

export default function HistorySection() {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [limit],
    );

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    if (loading) {
        return (
            <DetailSection
                title="Billing History"
                icon="fa-duotone fa-regular fa-receipt"
                accent="yellow"
            >
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md" />
                    <span className="ml-3 text-sm text-dark/50">
                        Loading invoices...
                    </span>
                </div>
            </DetailSection>
        );
    }

    return (
        <DetailSection
            title="Billing History"
            icon="fa-duotone fa-regular fa-receipt"
            accent="yellow"
        >
            {/* Error message */}
            {error && (
                <AlertBanner type="error" className="mb-4">
                    {error}
                    <Button
                        color="coral"
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchInvoices()}
                        className="ml-2"
                    >
                        Retry
                    </Button>
                </AlertBanner>
            )}

            {/* Empty state */}
            {invoices.length === 0 && !error ? (
                <EmptyState
                    icon="fa-duotone fa-regular fa-file-invoice"
                    title="No Billing History"
                    description="Your invoices will appear here once you have an active subscription."
                    color="yellow"
                />
            ) : (
                <>
                    {/* Invoice table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-dark text-white">
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
                                        className={`border-b-4 border-cream ${
                                            i % 2 === 0
                                                ? "bg-white"
                                                : "bg-cream/50"
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-sm font-bold text-dark whitespace-nowrap">
                                            {formatDate(invoice.created)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-bold text-dark">
                                                {invoice.number || "Invoice"}
                                            </div>
                                            <div className="text-sm text-dark/50">
                                                {getBillingPeriod(
                                                    invoice.period_start,
                                                    invoice.period_end,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-black text-dark">
                                            {formatAmount(
                                                invoice.status === "paid"
                                                    ? invoice.amount_paid
                                                    : invoice.amount_due,
                                                invoice.currency,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                color={invoiceStatusVariant(
                                                    invoice.status,
                                                )}
                                                size="sm"
                                            >
                                                {formatStatus(invoice.status)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {invoice.invoice_pdf ? (
                                                <a
                                                    href={invoice.invoice_pdf}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-bold text-purple hover:text-purple/70 flex items-center gap-1"
                                                >
                                                    <i className="fa-duotone fa-regular fa-download" />
                                                    PDF
                                                </a>
                                            ) : (
                                                <span className="text-dark/30 text-sm">
                                                    \u2014
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
                            <Button
                                color="yellow"
                                variant="outline"
                                size="sm"
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
                                        <i className="fa-duotone fa-regular fa-chevron-down mr-1" />
                                        Load More
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </DetailSection>
    );
}
