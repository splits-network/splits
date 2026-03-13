"use client";

import type {
    PlacementInvoice,
    PayoutTransaction,
    PayoutSchedule,
    EscrowHold,
    InvoiceStatus,
    TransactionStatus,
    ScheduleStatus,
    EscrowHoldStatus,
} from "../../billing-types";
import { BaselBadge, type BaselSemanticColor } from "@splits-network/basel-ui";
import { formatCurrency, formatDate } from "./helpers";

/* ─── Status Color Helpers ─────────────────────────────────────────────── */

const INVOICE_COLOR: Record<InvoiceStatus, BaselSemanticColor> = {
    paid: "success",
    open: "info",
    draft: "neutral",
    void: "error",
    uncollectible: "error",
};

const TX_COLOR: Record<TransactionStatus, BaselSemanticColor> = {
    paid: "success",
    pending: "warning",
    processing: "info",
    failed: "error",
    reversed: "error",
    on_hold: "warning",
};

const SCHEDULE_COLOR: Record<ScheduleStatus, BaselSemanticColor> = {
    scheduled: "info",
    triggered: "primary",
    cancelled: "neutral",
    pending: "warning",
    processing: "info",
    processed: "success",
    failed: "error",
};

const ESCROW_COLOR: Record<EscrowHoldStatus, BaselSemanticColor> = {
    active: "warning",
    released: "success",
    cancelled: "neutral",
};

function formatLabel(s: string | undefined | null): string {
    if (!s) return "";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBillingTerms(terms: string | undefined | null): string {
    if (!terms) return "";
    switch (terms) {
        case "net_30": return "Net 30";
        case "net_60": return "Net 60";
        case "net_90": return "Net 90";
        case "immediate": return "Immediate";
        default: return terms;
    }
}

/* ─── Invoice Section ──────────────────────────────────────────────────── */

export function InvoiceSection({ invoice }: { invoice: PlacementInvoice | null }) {
    if (!invoice) {
        return (
            <div className="border-l-4 border-l-base-300 pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Invoice
                </p>
                <p className="text-sm text-base-content/40 italic">
                    No invoice generated for this placement.
                </p>
            </div>
        );
    }

    return (
        <div className="border-l-4 border-l-primary pl-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30">
                    Invoice
                </p>
                <BaselBadge color={INVOICE_COLOR[invoice.invoice_status]} size="sm" variant="soft">
                    {formatLabel(invoice.invoice_status)}
                </BaselBadge>
            </div>

            <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                {invoice.stripe_invoice_number && (
                    <Row label="Invoice #" value={invoice.stripe_invoice_number} />
                )}
                <Row label="Amount Due" value={formatCurrency(invoice.amount_due)} />
                <Row label="Amount Paid" value={formatCurrency(invoice.amount_paid)} />
                <Row label="Billing Terms" value={formatBillingTerms(invoice.billing_terms)} />
                {invoice.due_date && <Row label="Due Date" value={formatDate(invoice.due_date)} />}
                {invoice.paid_at && <Row label="Paid" value={formatDate(invoice.paid_at)} />}
                <Row
                    label="Funds Available"
                    value={
                        invoice.funds_available
                            ? invoice.funds_available_at
                                ? `Yes — ${formatDate(invoice.funds_available_at)}`
                                : "Yes"
                            : "Not yet"
                    }
                />
            </div>

            {/* Action links */}
            {(invoice.hosted_invoice_url || invoice.invoice_pdf_url) && (
                <div className="flex gap-3 mt-3">
                    {invoice.hosted_invoice_url && (
                        <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-ghost text-primary"
                        >
                            <i className="fa-duotone fa-regular fa-external-link mr-1" />
                            View Invoice
                        </a>
                    )}
                    {invoice.invoice_pdf_url && (
                        <a
                            href={invoice.invoice_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-ghost text-primary"
                        >
                            <i className="fa-duotone fa-regular fa-file-pdf mr-1" />
                            Download PDF
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Payout Transactions Section ──────────────────────────────────────── */

export function PayoutTransactionsSection({
    transactions,
}: {
    transactions: PayoutTransaction[];
}) {
    if (transactions.length === 0) {
        return (
            <div className="border-l-4 border-l-base-300 pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Payout Transactions
                </p>
                <p className="text-sm text-base-content/40 italic">
                    No payout transactions for this placement.
                </p>
            </div>
        );
    }

    return (
        <div className="border-l-4 border-l-primary pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                Payout Transactions
            </p>
            <ul className="space-y-2">
                {transactions.map((tx) => (
                    <li
                        key={tx.id}
                        className="flex items-center justify-between border-b border-base-200 pb-2"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <BaselBadge color={TX_COLOR[tx.status]} size="xs" variant="soft">
                                {formatLabel(tx.status)}
                            </BaselBadge>
                            <span className="text-sm font-semibold truncate">
                                {tx.recruiter_name || "Unknown"}
                            </span>
                            {tx.split_role && (
                                <span className="text-sm text-base-content/40 capitalize">
                                    ({formatLabel(tx.split_role)})
                                </span>
                            )}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                            <span className="text-sm font-bold">
                                {formatCurrency(tx.amount)}
                            </span>
                            {tx.completed_at && (
                                <p className="text-sm text-base-content/40">
                                    {formatDate(tx.completed_at)}
                                </p>
                            )}
                            {tx.failed_at && (
                                <p className="text-sm text-error">
                                    Failed {formatDate(tx.failed_at)}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ─── Payout Schedule Section ──────────────────────────────────────────── */

export function PayoutScheduleSection({
    schedules,
}: {
    schedules: PayoutSchedule[];
}) {
    if (schedules.length === 0) {
        return (
            <div className="border-l-4 border-l-base-300 pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Payout Schedule
                </p>
                <p className="text-sm text-base-content/40 italic">
                    No payout scheduled for this placement.
                </p>
            </div>
        );
    }

    return (
        <div className="border-l-4 border-l-primary pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                Payout Schedule
            </p>
            <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                {schedules.map((s) => (
                    <div key={s.id} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">
                                {formatDate(s.scheduled_date)}
                            </span>
                            <BaselBadge color={SCHEDULE_COLOR[s.status]} size="xs" variant="soft">
                                {formatLabel(s.status)}
                            </BaselBadge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-sm text-base-content/40">
                            <span>Trigger: {formatLabel(s.trigger_event)}</span>
                            {s.guarantee_completion_date && (
                                <span>
                                    Guarantee ends: {formatDate(s.guarantee_completion_date)}
                                </span>
                            )}
                            {s.processed_at && (
                                <span>Processed: {formatDate(s.processed_at)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Escrow Holds Section ─────────────────────────────────────────────── */

export function EscrowHoldsSection({ holds }: { holds: EscrowHold[] }) {
    if (holds.length === 0) return null;

    return (
        <div className="border-l-4 border-l-warning pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                Escrow Holds
            </p>
            <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                {holds.map((h) => (
                    <div key={h.id} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold">
                                {formatCurrency(h.hold_amount)}
                            </span>
                            <BaselBadge color={ESCROW_COLOR[h.status]} size="xs" variant="soft">
                                {formatLabel(h.status)}
                            </BaselBadge>
                        </div>
                        <p className="text-sm text-base-content/50 mb-1">{h.hold_reason}</p>
                        <div className="flex flex-wrap gap-x-4 text-sm text-base-content/40">
                            <span>Held: {formatDate(h.held_at)}</span>
                            <span>Release: {formatDate(h.release_scheduled_date)}</span>
                            {h.released_at && (
                                <span>Released: {formatDate(h.released_at)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Shared Row Component ─────────────────────────────────────────────── */

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40">
                {label}
            </span>
            <span className="text-sm font-semibold text-right">{value}</span>
        </div>
    );
}
