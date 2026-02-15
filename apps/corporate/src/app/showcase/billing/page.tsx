"use client";

import { useState, useMemo, Fragment } from "react";
import { mockBilling } from "@/data/mock-billing";
import type { BillingListing } from "@/types/billing-listing";
import { BillingAnimator } from "./billing-animator";

// ─── Memphis Color Palette ──────────────────────────────────────────────────
const COLORS = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

const ACCENT_CYCLE = [COLORS.coral, COLORS.teal, COLORS.yellow, COLORS.purple];

type ViewMode = "table" | "grid" | "gmail";

// ─── Sidebar Navigation ────────────────────────────────────────────────────

const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2-plus", color: COLORS.coral },
    { key: "roles", label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", color: COLORS.teal },
    { key: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie", color: COLORS.purple },
    { key: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-users", color: COLORS.coral },
    { key: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-building", color: COLORS.yellow },
    { key: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", color: COLORS.teal },
    { key: "messages", label: "Messages", icon: "fa-duotone fa-regular fa-comments", color: COLORS.purple },
    { key: "placements", label: "Placements", icon: "fa-duotone fa-regular fa-handshake", color: COLORS.coral },
] as const;

const ACTIVE_NAV = "placements";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatCurrencyShort(value: number) {
    const abs = Math.abs(value);
    if (abs >= 1000) {
        const formatted = `$${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}K`;
        return value < 0 ? `-${formatted}` : formatted;
    }
    return formatCurrency(value);
}

function statusColor(status: BillingListing["status"]) {
    switch (status) {
        case "paid": return COLORS.teal;
        case "pending": return COLORS.yellow;
        case "overdue": return COLORS.coral;
        case "cancelled": return COLORS.purple;
        case "draft": return COLORS.purple;
    }
}

function typeLabel(type: BillingListing["type"]) {
    switch (type) {
        case "placement_fee": return "Placement";
        case "subscription": return "Subscription";
        case "platform_fee": return "Platform Fee";
        case "refund": return "Refund";
        case "credit": return "Credit";
    }
}

function typeIcon(type: BillingListing["type"]) {
    switch (type) {
        case "placement_fee": return "fa-duotone fa-regular fa-handshake";
        case "subscription": return "fa-duotone fa-regular fa-rotate";
        case "platform_fee": return "fa-duotone fa-regular fa-percent";
        case "refund": return "fa-duotone fa-regular fa-arrow-rotate-left";
        case "credit": return "fa-duotone fa-regular fa-circle-minus";
    }
}

function paymentMethodLabel(method?: BillingListing["paymentMethod"]) {
    if (!method) return "N/A";
    switch (method) {
        case "credit_card": return "Credit Card";
        case "bank_transfer": return "Bank Transfer";
        case "ach": return "ACH";
        case "wire": return "Wire Transfer";
    }
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function InvoiceDetail({ invoice, accent, onClose }: { invoice: BillingListing; accent: string; onClose?: () => void }) {
    const total = invoice.amount.value + (invoice.taxAmount ?? 0);

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b-4" style={{ borderColor: accent }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {invoice.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-star"></i>
                                High Value
                            </span>
                        )}
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2"
                            style={{ color: COLORS.dark }}>
                            {invoice.invoiceNumber}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-bold" style={{ color: accent }}>{invoice.client.company}</span>
                            <span style={{ color: COLORS.dark, opacity: 0.5 }}>|</span>
                            <span style={{ color: COLORS.dark, opacity: 0.7 }}>
                                <i className="fa-duotone fa-regular fa-user mr-1"></i>
                                {invoice.client.name}
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-sm border-2 transition-transform hover:-translate-y-0.5"
                            style={{ borderColor: accent, color: accent }}>
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    )}
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: statusColor(invoice.status), color: statusColor(invoice.status) }}>
                        {invoice.status}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                        style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                        <i className={`${typeIcon(invoice.type)} mr-1`}></i>
                        {typeLabel(invoice.type)}
                    </span>
                    {invoice.recurringInterval && (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2"
                            style={{ borderColor: COLORS.dark, color: COLORS.dark, opacity: 0.6 }}>
                            <i className="fa-duotone fa-regular fa-rotate mr-1"></i>
                            {invoice.recurringInterval}
                        </span>
                    )}
                </div>
            </div>

            {/* Amount & Stats */}
            <div className="grid grid-cols-3 border-b-4" style={{ borderColor: accent }}>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{formatCurrency(invoice.amount.value)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Amount</div>
                </div>
                <div className="p-4 text-center" style={{ borderRight: `2px solid ${accent}30` }}>
                    <div className="text-lg font-black" style={{ color: accent }}>{formatCurrency(invoice.taxAmount ?? 0)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Tax</div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black" style={{ color: accent }}>{formatCurrency(total)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Total</div>
                </div>
            </div>

            {/* Description */}
            <div className="p-6">
                <p className="text-sm leading-relaxed mb-6" style={{ color: COLORS.dark, opacity: 0.8 }}>
                    {invoice.description}
                </p>

                {/* Line Items */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                            <i className="fa-duotone fa-regular fa-list"></i>
                        </span>
                        Line Items
                    </h3>
                    <div className="space-y-2">
                        {invoice.lineItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-2"
                                style={{ borderColor: `${COLORS.dark}15` }}>
                                <span className="text-sm" style={{ color: COLORS.dark, opacity: 0.75 }}>
                                    {item.description}
                                </span>
                                <span className="text-sm font-bold flex-shrink-0 ml-4" style={{ color: COLORS.dark }}>
                                    {formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))}
                        {invoice.taxAmount !== undefined && invoice.taxAmount > 0 && (
                            <div className="flex items-center justify-between p-3 border-2"
                                style={{ borderColor: `${COLORS.dark}15`, backgroundColor: `${COLORS.cream}` }}>
                                <span className="text-sm font-bold" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                    Tax
                                </span>
                                <span className="text-sm font-bold" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                    {formatCurrency(invoice.taxAmount)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-3 border-4"
                            style={{ borderColor: accent }}>
                            <span className="text-sm font-black uppercase tracking-wider" style={{ color: COLORS.dark }}>
                                Total
                            </span>
                            <span className="text-sm font-black" style={{ color: accent }}>
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Related Placement */}
                {invoice.relatedPlacement && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                            style={{ color: COLORS.dark }}>
                            <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: COLORS.teal, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-handshake"></i>
                            </span>
                            Related Placement
                        </h3>
                        <div className="p-4 border-4" style={{ borderColor: COLORS.teal }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center"
                                    style={{ backgroundColor: `${COLORS.teal}20` }}>
                                    <i className="fa-duotone fa-regular fa-user text-sm" style={{ color: COLORS.teal }}></i>
                                </div>
                                <div>
                                    <div className="font-bold text-sm" style={{ color: COLORS.dark }}>
                                        {invoice.relatedPlacement.candidateName}
                                    </div>
                                    <div className="text-xs" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                        {invoice.relatedPlacement.jobTitle} at {invoice.relatedPlacement.company}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Details */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color: COLORS.dark }}>
                        <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                            <i className="fa-duotone fa-regular fa-credit-card"></i>
                        </span>
                        Payment Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLORS.dark, opacity: 0.5 }}>Method</div>
                            <div className="text-sm font-bold" style={{ color: COLORS.dark }}>{paymentMethodLabel(invoice.paymentMethod)}</div>
                        </div>
                        <div className="p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLORS.dark, opacity: 0.5 }}>Due Date</div>
                            <div className="text-sm font-bold" style={{ color: COLORS.dark }}>{formatDate(invoice.dueDate)}</div>
                        </div>
                        <div className="p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLORS.dark, opacity: 0.5 }}>Created</div>
                            <div className="text-sm font-bold" style={{ color: COLORS.dark }}>{formatDate(invoice.createdDate)}</div>
                        </div>
                        <div className="p-3 border-2" style={{ borderColor: `${COLORS.dark}15` }}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLORS.dark, opacity: 0.5 }}>Paid Date</div>
                            <div className="text-sm font-bold" style={{ color: invoice.paidDate ? COLORS.teal : COLORS.dark, opacity: invoice.paidDate ? 1 : 0.4 }}>
                                {invoice.paidDate ? formatDate(invoice.paidDate) : "Unpaid"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                            style={{ color: COLORS.dark }}>
                            <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                                style={{ backgroundColor: COLORS.purple, color: COLORS.white }}>
                                <i className="fa-duotone fa-regular fa-note-sticky"></i>
                            </span>
                            Notes
                        </h3>
                        <div className="p-4 border-2" style={{ borderColor: `${COLORS.purple}40`, backgroundColor: `${COLORS.purple}08` }}>
                            <p className="text-sm leading-relaxed" style={{ color: COLORS.dark, opacity: 0.75 }}>
                                {invoice.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Client */}
                <div className="p-4 border-4" style={{ borderColor: accent }}>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3" style={{ color: COLORS.dark }}>
                        Client
                    </h3>
                    <div className="flex items-center gap-3">
                        <img src={invoice.client.avatar} alt={invoice.client.name}
                            className="w-12 h-12 object-cover border-2" style={{ borderColor: accent }} />
                        <div>
                            <div className="font-bold text-sm" style={{ color: COLORS.dark }}>{invoice.client.name}</div>
                            <div className="text-xs" style={{ color: accent }}>{invoice.client.company}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Table View ─────────────────────────────────────────────────────────────

function TableView({ invoices, onSelect, selectedId }: { invoices: BillingListing[]; onSelect: (inv: BillingListing) => void; selectedId: string | null }) {
    const columnHeaders = ["", "Invoice #", "Client", "Amount", "Status", "Type", "Due Date", "Paid Date"];
    const colCount = columnHeaders.length;

    return (
        <div className="overflow-x-auto border-4" style={{ borderColor: COLORS.dark }}>
            <table className="w-full" style={{ minWidth: 800 }}>
                <thead>
                    <tr style={{ backgroundColor: COLORS.dark }}>
                        {columnHeaders.map((h, i) => (
                            <th key={i} className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${i === 0 ? "w-8" : ""}`}
                                style={{ color: ACCENT_CYCLE[i % 4] }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice, idx) => {
                        const accent = ACCENT_CYCLE[idx % 4];
                        const isSelected = selectedId === invoice.id;
                        return (
                            <Fragment key={invoice.id}>
                                <tr
                                    onClick={() => onSelect(invoice)}
                                    className="cursor-pointer transition-colors"
                                    style={{
                                        backgroundColor: isSelected ? `${accent}15` : idx % 2 === 0 ? COLORS.white : COLORS.cream,
                                        borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                                    }}>
                                    <td className="px-4 py-3 w-8">
                                        <i className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-[10px] transition-transform`}
                                            style={{ color: isSelected ? accent : `${COLORS.dark}40` }}></i>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {invoice.featured && (
                                                <i className="fa-duotone fa-regular fa-star text-[10px]" style={{ color: COLORS.yellow }}></i>
                                            )}
                                            <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{invoice.invoiceNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: accent }}>{invoice.client.company}</td>
                                    <td className="px-4 py-3 text-xs font-bold" style={{ color: invoice.amount.value < 0 ? COLORS.coral : COLORS.dark }}>
                                        {formatCurrency(invoice.amount.value)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: statusColor(invoice.status), color: statusColor(invoice.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                            <i className={`${typeIcon(invoice.type)} mr-1`}></i>
                                            {typeLabel(invoice.type)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.dark, opacity: 0.7 }}>{formatDate(invoice.dueDate)}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: invoice.paidDate ? COLORS.teal : COLORS.dark, opacity: invoice.paidDate ? 0.8 : 0.4 }}>
                                        {invoice.paidDate ? formatDate(invoice.paidDate) : "—"}
                                    </td>
                                </tr>
                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td colSpan={colCount} className="p-0"
                                            style={{ backgroundColor: COLORS.white, borderTop: `4px solid ${accent}`, borderBottom: `4px solid ${accent}` }}>
                                            <InvoiceDetail invoice={invoice} accent={accent} onClose={() => onSelect(invoice)} />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Grid View ──────────────────────────────────────────────────────────────

function GridView({ invoices, onSelect, selectedId }: { invoices: BillingListing[]; onSelect: (inv: BillingListing) => void; selectedId: string | null }) {
    const selectedInvoice = invoices.find(inv => inv.id === selectedId);

    return (
        <div className="flex gap-6">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${selectedInvoice ? "w-1/2 grid-cols-1 lg:grid-cols-2" : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {invoices.map((invoice, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === invoice.id;
                    return (
                        <div key={invoice.id}
                            onClick={() => onSelect(invoice)}
                            className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
                            style={{
                                borderColor: isSelected ? accent : `${COLORS.dark}30`,
                                backgroundColor: COLORS.white,
                            }}>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-8 h-8"
                                style={{ backgroundColor: accent }} />

                            {invoice.featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                                    style={{ backgroundColor: COLORS.yellow, color: COLORS.dark }}>
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    High Value
                                </span>
                            )}

                            <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1"
                                style={{ color: COLORS.dark }}>
                                {invoice.invoiceNumber}
                            </h3>
                            <div className="text-sm font-bold mb-1" style={{ color: accent }}>{invoice.client.company}</div>
                            <div className="text-xs mb-3" style={{ color: COLORS.dark, opacity: 0.6 }}>
                                <i className="fa-duotone fa-regular fa-user mr-1"></i>
                                {invoice.client.name}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-black" style={{ color: invoice.amount.value < 0 ? COLORS.coral : COLORS.dark }}>
                                    {formatCurrencyShort(invoice.amount.value)}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(invoice.status), color: statusColor(invoice.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {invoice.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                    style={{ borderColor: `${accent}60`, color: accent }}>
                                    <i className={`${typeIcon(invoice.type)} mr-1`}></i>
                                    {typeLabel(invoice.type)}
                                </span>
                                {invoice.recurringInterval && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2"
                                        style={{ borderColor: `${COLORS.purple}60`, color: COLORS.purple }}>
                                        {invoice.recurringInterval}
                                    </span>
                                )}
                            </div>

                            <div className="text-xs mb-2" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                Due: {formatDate(invoice.dueDate)}
                            </div>

                            {invoice.relatedPlacement && (
                                <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                    <div className="w-7 h-7 flex items-center justify-center"
                                        style={{ backgroundColor: `${COLORS.teal}20` }}>
                                        <i className="fa-duotone fa-regular fa-handshake text-[10px]" style={{ color: COLORS.teal }}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold truncate" style={{ color: COLORS.dark }}>{invoice.relatedPlacement.candidateName}</div>
                                        <div className="text-[10px] truncate" style={{ color: COLORS.dark, opacity: 0.5 }}>{invoice.relatedPlacement.jobTitle}</div>
                                    </div>
                                </div>
                            )}

                            {!invoice.relatedPlacement && (
                                <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `2px solid ${accent}30` }}>
                                    <img src={invoice.client.avatar} alt={invoice.client.name}
                                        className="w-7 h-7 object-cover border-2" style={{ borderColor: accent }} />
                                    <div>
                                        <div className="text-xs font-bold" style={{ color: COLORS.dark }}>{invoice.client.name}</div>
                                        <div className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.5 }}>{invoice.client.company}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedInvoice && (
                <div className="w-1/2 border-4 flex-shrink-0 sticky top-4 self-start"
                    style={{ borderColor: ACCENT_CYCLE[invoices.indexOf(selectedInvoice) % 4], backgroundColor: COLORS.white, maxHeight: "calc(100vh - 2rem)" }}>
                    <InvoiceDetail invoice={selectedInvoice} accent={ACCENT_CYCLE[invoices.indexOf(selectedInvoice) % 4]} onClose={() => onSelect(selectedInvoice)} />
                </div>
            )}
        </div>
    );
}

// ─── Gmail View ─────────────────────────────────────────────────────────────

function GmailView({ invoices, onSelect, selectedId }: { invoices: BillingListing[]; onSelect: (inv: BillingListing) => void; selectedId: string | null }) {
    const selectedInvoice = invoices.find(inv => inv.id === selectedId);

    return (
        <div className="flex gap-0 border-4" style={{ borderColor: COLORS.dark, minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4" style={{ borderColor: COLORS.dark, maxHeight: "calc(100vh - 16rem)" }}>
                {invoices.map((invoice, idx) => {
                    const accent = ACCENT_CYCLE[idx % 4];
                    const isSelected = selectedId === invoice.id;
                    return (
                        <div key={invoice.id}
                            onClick={() => onSelect(invoice)}
                            className="cursor-pointer p-4 transition-colors"
                            style={{
                                backgroundColor: isSelected ? `${accent}15` : COLORS.white,
                                borderBottom: `2px solid ${COLORS.dark}15`,
                                borderLeft: isSelected ? `4px solid ${accent}` : "4px solid transparent",
                            }}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {invoice.featured && (
                                        <i className="fa-duotone fa-regular fa-star text-[10px] flex-shrink-0" style={{ color: COLORS.yellow }}></i>
                                    )}
                                    <h4 className="font-black text-sm uppercase tracking-tight truncate"
                                        style={{ color: COLORS.dark }}>
                                        {invoice.invoiceNumber}
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap"
                                    style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    {timeAgo(invoice.createdDate)}
                                </span>
                            </div>
                            <div className="text-xs font-bold mb-1" style={{ color: accent }}>{invoice.client.company}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black" style={{ color: invoice.amount.value < 0 ? COLORS.coral : COLORS.dark }}>
                                    {formatCurrency(invoice.amount.value)}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase"
                                    style={{ backgroundColor: statusColor(invoice.status), color: statusColor(invoice.status) === COLORS.yellow ? COLORS.dark : COLORS.white }}>
                                    {invoice.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px]" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    <i className={`${typeIcon(invoice.type)} mr-1`}></i>
                                    {typeLabel(invoice.type)}
                                </span>
                                <span className="text-[10px]" style={{ color: COLORS.dark, opacity: 0.4 }}>
                                    Due: {formatDate(invoice.dueDate)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden" style={{ backgroundColor: COLORS.white }}>
                {selectedInvoice ? (
                    <InvoiceDetail invoice={selectedInvoice} accent={ACCENT_CYCLE[invoices.indexOf(selectedInvoice) % 4]} />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            {/* Memphis decoration */}
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                Select an Invoice
                            </h3>
                            <p className="text-sm" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                Click an invoice on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BillingSixPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredInvoices = useMemo(() => {
        return mockBilling.filter(invoice => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = invoice.invoiceNumber.toLowerCase().includes(q)
                    || invoice.client.name.toLowerCase().includes(q)
                    || invoice.client.company.toLowerCase().includes(q)
                    || invoice.description.toLowerCase().includes(q)
                    || (invoice.relatedPlacement?.candidateName.toLowerCase().includes(q) ?? false)
                    || (invoice.relatedPlacement?.jobTitle.toLowerCase().includes(q) ?? false);
                if (!match) return false;
            }
            if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
            if (typeFilter !== "all" && invoice.type !== typeFilter) return false;
            return true;
        });
    }, [searchQuery, statusFilter, typeFilter]);

    const handleSelect = (invoice: BillingListing) => {
        setSelectedInvoiceId(prev => prev === invoice.id ? null : invoice.id);
    };

    const stats = {
        total: mockBilling.length,
        revenue: mockBilling
            .filter(inv => inv.status === "paid" && inv.amount.value > 0)
            .reduce((sum, inv) => sum + inv.amount.value, 0),
        outstanding: mockBilling
            .filter(inv => inv.status === "pending" || inv.status === "overdue")
            .reduce((sum, inv) => sum + inv.amount.value, 0),
        overdue: mockBilling.filter(inv => inv.status === "overdue").length,
    };

    return (
        <BillingAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HEADER - Memphis style
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden py-16" style={{ backgroundColor: COLORS.dark }}>
                {/* Memphis shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[4%] w-20 h-20 rounded-full border-[5px] opacity-0"
                        style={{ borderColor: COLORS.coral }} />
                    <div className="memphis-shape absolute top-[50%] right-[6%] w-16 h-16 rounded-full opacity-0"
                        style={{ backgroundColor: COLORS.teal }} />
                    <div className="memphis-shape absolute bottom-[10%] left-[12%] w-10 h-10 rounded-full opacity-0"
                        style={{ backgroundColor: COLORS.yellow }} />
                    <div className="memphis-shape absolute top-[20%] right-[18%] w-14 h-14 rotate-12 opacity-0"
                        style={{ backgroundColor: COLORS.purple }} />
                    <div className="memphis-shape absolute bottom-[25%] right-[30%] w-20 h-8 -rotate-6 border-[3px] opacity-0"
                        style={{ borderColor: COLORS.coral }} />
                    <div className="memphis-shape absolute top-[40%] left-[22%] w-10 h-10 rotate-45 opacity-0"
                        style={{ backgroundColor: COLORS.coral }} />
                    {/* Triangle */}
                    <div className="memphis-shape absolute top-[15%] left-[45%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "20px solid transparent",
                            borderRight: "20px solid transparent",
                            borderBottom: "35px solid #FFE66D",
                            transform: "rotate(-12deg)",
                        }} />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[15%] right-[42%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[65%] left-[35%] opacity-0" width="80" height="25" viewBox="0 0 80 25">
                        <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20"
                            fill="none" stroke={COLORS.purple} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[60%] left-[7%] opacity-0" width="25" height="25" viewBox="0 0 25 25">
                        <line x1="12.5" y1="2" x2="12.5" y2="23" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" />
                        <line x1="2" y1="12.5" x2="23" y2="12.5" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="header-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: COLORS.coral, color: COLORS.white }}>
                                <i className="fa-duotone fa-regular fa-file-invoice-dollar"></i>
                                Billing
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0"
                            style={{ color: COLORS.white }}>
                            Revenue{" "}
                            <span className="relative inline-block">
                                <span style={{ color: COLORS.coral }}>Tracker</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: COLORS.coral }} />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-0"
                            style={{ color: COLORS.white, opacity: 0.7 }}>
                            Manage invoices, track payments, and monitor revenue.
                            Split-fee billing, fully transparent.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {[
                                { label: "Total Invoices", value: String(stats.total), color: COLORS.coral },
                                { label: "Revenue", value: formatCurrencyShort(stats.revenue), color: COLORS.teal },
                                { label: "Outstanding", value: formatCurrencyShort(stats.outstanding), color: COLORS.yellow },
                                { label: "Overdue", value: String(stats.overdue), color: COLORS.purple },
                            ].map((stat, i) => (
                                <div key={i} className="stat-pill flex items-center gap-2 px-4 py-2 border-2 opacity-0"
                                    style={{ borderColor: stat.color }}>
                                    <span className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${COLORS.white}80` }}>
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SIDEBAR + CONTROLS + CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <section className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
                <div className="flex relative">
                    {/* ── Mobile sidebar overlay ── */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            style={{ backgroundColor: "rgba(26,26,46,0.5)" }} />
                    )}

                    {/* ── Sidebar ── */}
                    <aside
                        className={`
                            sidebar-nav
                            fixed lg:sticky top-0 left-0 z-50 lg:z-auto
                            h-screen lg:h-auto
                            w-64 lg:w-56 flex-shrink-0
                            border-r-4 overflow-y-auto
                            transition-transform duration-300
                            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                        `}
                        style={{ backgroundColor: COLORS.dark, borderColor: `${COLORS.white}15` }}>

                        {/* Sidebar header */}
                        <div className="p-5 border-b-2" style={{ borderColor: `${COLORS.white}15` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 flex items-center justify-center"
                                        style={{ backgroundColor: COLORS.coral }}>
                                        <i className="fa-duotone fa-regular fa-bolt text-sm" style={{ color: COLORS.white }}></i>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: COLORS.white }}>
                                        Splits
                                    </span>
                                </div>
                                {/* Close button (mobile only) */}
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="lg:hidden w-7 h-7 flex items-center justify-center border-2"
                                    style={{ borderColor: `${COLORS.white}40`, color: COLORS.white }}>
                                    <i className="fa-duotone fa-regular fa-xmark text-xs"></i>
                                </button>
                            </div>
                        </div>

                        {/* Nav items */}
                        <nav className="p-3 space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = item.key === ACTIVE_NAV;
                                return (
                                    <button key={item.key}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: isActive ? `${item.color}20` : "transparent",
                                            borderLeft: isActive ? `4px solid ${item.color}` : "4px solid transparent",
                                        }}>
                                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: isActive ? item.color : "transparent",
                                                border: isActive ? "none" : `2px solid ${COLORS.white}25`,
                                            }}>
                                            <i className={`${item.icon} text-xs`}
                                                style={{ color: isActive ? (item.color === COLORS.yellow ? COLORS.dark : COLORS.white) : `${COLORS.white}60` }}></i>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: isActive ? item.color : `${COLORS.white}60` }}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Sidebar footer decoration */}
                        <div className="mt-auto p-5 border-t-2" style={{ borderColor: `${COLORS.white}10` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                <div className="w-4 h-4 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: COLORS.purple }} />
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Content ── */}
                    <div className="flex-1 min-w-0 py-8">
                        <div className="px-4 lg:px-8">
                            {/* Mobile sidebar toggle */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border-4 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                                style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white, color: COLORS.dark }}>
                                <i className="fa-duotone fa-regular fa-bars"></i>
                                Menu
                            </button>

                            {/* Controls Bar */}
                            <div className="controls-bar flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8 p-4 border-4 opacity-0"
                                style={{ borderColor: COLORS.dark, backgroundColor: COLORS.white }}>
                                {/* Search */}
                                <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2"
                                    style={{ borderColor: `${COLORS.dark}30` }}>
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" style={{ color: COLORS.coral }}></i>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search invoices, clients, placements..."
                                        className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder-current"
                                        style={{ color: COLORS.dark }}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")}
                                            className="text-xs font-bold uppercase" style={{ color: COLORS.coral }}>
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Status filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Status:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.teal, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>

                                {/* Type filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>Type:</span>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
                                        style={{ borderColor: COLORS.purple, color: COLORS.dark }}>
                                        <option value="all">All</option>
                                        <option value="placement_fee">Placement</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="platform_fee">Platform Fee</option>
                                        <option value="refund">Refund</option>
                                        <option value="credit">Credit</option>
                                    </select>
                                </div>

                                {/* View mode toggles */}
                                <div className="flex items-center border-2" style={{ borderColor: COLORS.dark }}>
                                    {([
                                        { mode: "table" as ViewMode, icon: "fa-duotone fa-regular fa-table-list", label: "Table" },
                                        { mode: "grid" as ViewMode, icon: "fa-duotone fa-regular fa-grid-2", label: "Grid" },
                                        { mode: "gmail" as ViewMode, icon: "fa-duotone fa-regular fa-table-columns", label: "Split" },
                                    ]).map(({ mode, icon, label }) => (
                                        <button key={mode}
                                            onClick={() => { setViewMode(mode); setSelectedInvoiceId(null); }}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                                            style={{
                                                backgroundColor: viewMode === mode ? COLORS.dark : "transparent",
                                                color: viewMode === mode ? COLORS.yellow : COLORS.dark,
                                            }}>
                                            <i className={icon}></i>
                                            <span className="hidden sm:inline">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                    Showing {filteredInvoices.length} of {mockBilling.length} invoices
                                </span>
                                {searchQuery && (
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.coral }}>
                                        Filtered by: &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="listings-content opacity-0">
                                {filteredInvoices.length === 0 ? (
                                    <div className="text-center py-20 border-4" style={{ borderColor: `${COLORS.dark}20`, backgroundColor: COLORS.white }}>
                                        <div className="flex justify-center gap-3 mb-6">
                                            <div className="w-8 h-8 rotate-12" style={{ backgroundColor: COLORS.coral }} />
                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS.teal }} />
                                            <div className="w-8 h-8 rotate-45" style={{ backgroundColor: COLORS.yellow }} />
                                        </div>
                                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2" style={{ color: COLORS.dark }}>
                                            No Invoices Found
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: COLORS.dark, opacity: 0.5 }}>
                                            Try adjusting your search or filters
                                        </p>
                                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); }}
                                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                            style={{ borderColor: COLORS.coral, color: COLORS.coral }}>
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === "table" && (
                                            <TableView invoices={filteredInvoices} onSelect={handleSelect} selectedId={selectedInvoiceId} />
                                        )}
                                        {viewMode === "grid" && (
                                            <GridView invoices={filteredInvoices} onSelect={handleSelect} selectedId={selectedInvoiceId} />
                                        )}
                                        {viewMode === "gmail" && (
                                            <GmailView invoices={filteredInvoices} onSelect={handleSelect} selectedId={selectedInvoiceId} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </BillingAnimator>
    );
}
