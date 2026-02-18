"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Badge, Button, AlertBanner, EmptyState } from "@splits-network/memphis-ui";

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

interface CompanyInvoiceSectionProps {
    companyId: string;
}

function invoiceStatusColor(
    status: string,
): "teal" | "coral" | "yellow" | "dark" {
    const map: Record<string, "teal" | "coral" | "yellow" | "dark"> = {
        paid: "teal",
        open: "yellow",
        draft: "dark",
        void: "dark",
        uncollectible: "coral",
    };
    return map[status] || "dark";
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

export default function CompanyInvoiceSection({
    companyId,
}: CompanyInvoiceSectionProps) {
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
        return <AlertBanner type="error">{error}</AlertBanner>;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md" />
                <span className="ml-3 text-sm text-dark/50">
                    Loading invoices...
                </span>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <EmptyState
                icon="fa-duotone fa-regular fa-file-invoice"
                title="No Invoices Yet"
                description="Invoices will appear here when placements are confirmed."
                color="yellow"
            />
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-dark text-white">
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                Invoice #
                            </th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                Due Date
                            </th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice, i) => (
                            <tr
                                key={invoice.id}
                                className={`border-b-4 border-cream ${
                                    i % 2 === 0 ? "bg-white" : "bg-cream/50"
                                }`}
                            >
                                <td className="px-4 py-3 text-sm font-bold text-dark whitespace-nowrap">
                                    {formatDate(invoice.created_at)}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-dark">
                                    {invoice.stripe_invoice_number || "\u2014"}
                                </td>
                                <td className="px-4 py-3 text-sm font-black text-dark">
                                    {formatCurrency(
                                        invoice.amount_due,
                                        invoice.currency,
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        color={invoiceStatusColor(
                                            invoice.invoice_status,
                                        )}
                                        size="sm"
                                    >
                                        {invoiceStatusLabel(
                                            invoice.invoice_status,
                                        )}
                                    </Badge>
                                    {invoice.failure_reason && (
                                        <div className="text-sm text-coral mt-1">
                                            {invoice.failure_reason}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-dark">
                                    {invoice.due_date
                                        ? formatDate(invoice.due_date)
                                        : "\u2014"}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        {invoice.hosted_invoice_url && (
                                            <a
                                                href={
                                                    invoice.hosted_invoice_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold text-purple hover:text-purple/70 flex items-center gap-1"
                                            >
                                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                                View
                                            </a>
                                        )}
                                        {invoice.invoice_pdf_url && (
                                            <a
                                                href={invoice.invoice_pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold text-purple hover:text-purple/70 flex items-center gap-1"
                                            >
                                                <i className="fa-duotone fa-regular fa-file-pdf" />
                                                PDF
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4">
                    <Button
                        color="dark"
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        <i className="fa-duotone fa-regular fa-chevron-left" />
                    </Button>
                    <span className="text-sm font-bold text-dark">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        color="dark"
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        <i className="fa-duotone fa-regular fa-chevron-right" />
                    </Button>
                </div>
            )}
        </>
    );
}
