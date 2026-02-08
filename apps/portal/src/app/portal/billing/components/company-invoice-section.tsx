"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

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

function getStatusBadge(status: string) {
    const badges: Record<string, { class: string; label: string }> = {
        draft: { class: "badge-ghost", label: "Draft" },
        open: { class: "badge-info", label: "Open" },
        paid: { class: "badge-success", label: "Paid" },
        void: { class: "badge-ghost", label: "Void" },
        uncollectible: { class: "badge-error", label: "Uncollectible" },
    };
    const badge = badges[status] || {
        class: "badge-ghost",
        label: status,
    };
    return <span className={`badge ${badge.class} badge-sm`}>{badge.label}</span>;
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
                { params: { page: String(page), limit: String(limit) } }
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

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-file-invoice-dollar"></i>
                    Placement Invoices
                </h2>
                <div className="divider my-2"></div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                        <span className="ml-3 text-base-content/70">
                            Loading invoices...
                        </span>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-8 text-base-content/50">
                        <i className="fa-duotone fa-regular fa-file-invoice text-4xl mb-3 block"></i>
                        <p>No invoices yet</p>
                        <p className="text-sm mt-1">
                            Invoices will appear here when placements are
                            confirmed.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Invoice #</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="text-sm">
                                                {formatDate(invoice.created_at)}
                                            </td>
                                            <td className="text-sm font-mono">
                                                {invoice.stripe_invoice_number ||
                                                    "—"}
                                            </td>
                                            <td className="text-sm font-semibold">
                                                {formatCurrency(
                                                    invoice.amount_due,
                                                    invoice.currency
                                                )}
                                            </td>
                                            <td>
                                                {getStatusBadge(
                                                    invoice.invoice_status
                                                )}
                                                {invoice.failure_reason && (
                                                    <div className="text-xs text-error mt-1">
                                                        {invoice.failure_reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-sm">
                                                {invoice.due_date
                                                    ? formatDate(
                                                          invoice.due_date
                                                      )
                                                    : "—"}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {invoice.hosted_invoice_url && (
                                                        <a
                                                            href={
                                                                invoice.hosted_invoice_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-xs btn-ghost"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
                                                            View
                                                        </a>
                                                    )}
                                                    {invoice.invoice_pdf_url && (
                                                        <a
                                                            href={
                                                                invoice.invoice_pdf_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-xs btn-ghost"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-file-pdf"></i>
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
                            <div className="flex justify-center mt-4">
                                <div className="join">
                                    <button
                                        className="join-item btn btn-sm"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-left"></i>
                                    </button>
                                    <button className="join-item btn btn-sm btn-disabled">
                                        Page {page} of {totalPages}
                                    </button>
                                    <button
                                        className="join-item btn btn-sm"
                                        disabled={page >= totalPages}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
