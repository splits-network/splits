"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselStatusPill, BaselEmptyState } from "@splits-network/basel-ui";
import type { BaselSemanticColor } from "@splits-network/basel-ui";

interface PlacementInvoice {
    id: string;
    placement_id: string;
    company_id: string;
    stripe_invoice_number: string | null;
    invoice_status: string;
    amount_due: number;
    amount_paid: number;
    currency: string;
    collection_method: string;
    billing_terms: string;
    due_date: string | null;
    paid_at: string | null;
    failure_reason: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf_url: string | null;
    created_at: string;
}

interface BaselInvoiceSectionProps {
    companyId: string;
}

function invoiceStatusColor(status: string): BaselSemanticColor {
    const map: Record<string, BaselSemanticColor> = {
        paid: "success",
        open: "warning",
        draft: "neutral",
        void: "neutral",
        uncollectible: "error",
    };
    return map[status] || "neutral";
}

function invoiceStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        paid: "Paid",
        open: "Open",
        draft: "Draft",
        void: "Void",
        uncollectible: "Uncollectible",
    };
    return labels[status] || status;
}

function formatCurrency(amount: number, currency: string = "usd"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function BaselInvoiceSection({
    companyId,
}: BaselInvoiceSectionProps) {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState<PlacementInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get(
                `/company-billing-profiles/${companyId}/invoices`,
                { params: { page: String(page), limit: String(limit) } },
            );

            setInvoices(response?.data || []);
            setTotalPages(response?.pagination?.total_pages || 1);
        } catch (err: any) {
            console.error("Failed to fetch invoices:", err);
            setError(err.message || "Failed to load invoices");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId, page]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    if (error) {
        return (
            <div className="bg-error/5 border border-error/20 p-4">
                <p className="text-sm font-semibold text-error">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md" />
                <span className="ml-3 text-sm text-base-content/40">
                    Loading invoices...
                </span>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <BaselEmptyState
                icon="fa-duotone fa-regular fa-file-invoice"
                title="No Invoices Yet"
                subtitle="Invoices will appear here when placements are confirmed."
            />
        );
    }

    return (
        <>
            <div className="space-y-0">
                {invoices.map((invoice, i) => (
                    <div
                        key={invoice.id}
                        className={`flex items-center justify-between py-3 ${
                            i < invoices.length - 1
                                ? "border-b border-base-300"
                                : ""
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-file-invoice text-base-content/30" />
                            <div>
                                <p className="text-sm font-semibold">
                                    {formatDate(invoice.created_at)}
                                    {invoice.stripe_invoice_number && (
                                        <span className="text-xs text-base-content/40 ml-2 font-mono">
                                            {invoice.stripe_invoice_number}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-base-content/40">
                                    {formatCurrency(
                                        invoice.amount_due,
                                        invoice.currency,
                                    )}
                                    {invoice.due_date && (
                                        <>
                                            {" "}
                                            &middot; Due{" "}
                                            {formatDate(invoice.due_date)}
                                        </>
                                    )}
                                </p>
                                {invoice.failure_reason && (
                                    <p className="text-xs text-error mt-0.5">
                                        {invoice.failure_reason}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <BaselStatusPill
                                color={invoiceStatusColor(
                                    invoice.invoice_status,
                                )}
                            >
                                {invoiceStatusLabel(
                                    invoice.invoice_status,
                                )}
                            </BaselStatusPill>
                            <div className="flex gap-1">
                                {invoice.hosted_invoice_url && (
                                    <a
                                        href={invoice.hosted_invoice_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-xs btn-ghost"
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                    </a>
                                )}
                                {invoice.invoice_pdf_url && (
                                    <a
                                        href={invoice.invoice_pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-xs btn-ghost"
                                    >
                                        <i className="fa-duotone fa-regular fa-download" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4 pt-4 border-t border-base-300">
                    <button
                        className="btn btn-sm btn-ghost"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        <i className="fa-duotone fa-regular fa-chevron-left" />
                    </button>
                    <span className="text-sm text-base-content/50">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="btn btn-sm btn-ghost"
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        <i className="fa-duotone fa-regular fa-chevron-right" />
                    </button>
                </div>
            )}
        </>
    );
}
