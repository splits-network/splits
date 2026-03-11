"use client";

import { useState } from "react";
import {
    PanelHeader,
    PanelTabs,
    type PanelStat,
} from "@splits-network/basel-ui";
import type { Placement } from "../../types";
import { statusColorName } from "./status-color";
import {
    candidateName,
    candidateInitials,
    jobTitle,
    companyName,
    formatDate,
    formatCurrency,
    formatStatus,
    formatCurrencyShort,
    isNew,
} from "./helpers";
import { usePlacementBilling } from "./use-placement-billing";
import {
    InvoiceSection,
    PayoutTransactionsSection,
    PayoutScheduleSection,
    EscrowHoldsSection,
} from "./financials-billing-sections";
import {
    buildFinancialsTable,
    copyToClipboard,
    downloadCsv,
} from "./financials-export";

/* ─── Badge class mapping ──────────────────────────────────────────────── */

const STATUS_BADGE_CLASS: Record<string, string> = {
    success: "badge-success",
    info: "badge-info badge-soft",
    primary: "badge-primary",
    warning: "badge-warning badge-soft badge-outline",
    error: "badge-error",
    neutral: "badge-ghost",
};

/* ─── Tabs ─────────────────────────────────────────────────────────────── */

const TABS = [
    {
        label: "Financials",
        value: "financials",
        icon: "fa-duotone fa-regular fa-coins",
    },
    {
        label: "Dates",
        value: "dates",
        icon: "fa-duotone fa-regular fa-calendar",
    },
    {
        label: "Splits",
        value: "splits",
        icon: "fa-duotone fa-regular fa-pie-chart",
    },
];

/* ─── Detail Panel ─────────────────────────────────────────────────────── */

export function PlacementDetailPanel({
    placement,
    onClose,
}: {
    placement: Placement;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const state = placement.state || "unknown";
    const name = candidateName(placement);
    const initials = candidateInitials(placement);
    const company = companyName(placement);
    const job = jobTitle(placement);

    /* Header badges */
    const statusColor = statusColorName(state);
    const headerBadges = [
        {
            label: formatStatus(state),
            className: STATUS_BADGE_CLASS[statusColor] || "badge-ghost",
        },
        ...(isNew(placement)
            ? [
                  {
                      label: "New",
                      className: "badge-warning badge-soft badge-outline",
                  },
              ]
            : []),
    ];

    /* Meta items */
    const meta = [
        { icon: "fa-duotone fa-regular fa-briefcase", text: job },
        ...(placement.candidate?.email
            ? [
                  {
                      icon: "fa-duotone fa-regular fa-envelope",
                      text: placement.candidate.email,
                  },
              ]
            : []),
    ];

    /* Stats strip */
    const stats: PanelStat[] = [
        {
            label: "Salary",
            value: formatCurrencyShort(placement.salary || 0),
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Fee Rate",
            value: `${placement.fee_percentage || 0}%`,
            icon: "fa-duotone fa-regular fa-percent",
        },
        {
            label: "Your Share",
            value: formatCurrencyShort(placement.recruiter_share || 0),
            icon: "fa-duotone fa-regular fa-coins",
        },
        ...(placement.guarantee_days != null
            ? [
                  {
                      label: "Guarantee",
                      value: `${placement.guarantee_days}d`,
                      icon: "fa-duotone fa-regular fa-shield-check",
                  },
              ]
            : []),
    ];

    return (
        <div className="flex flex-col h-full w-full min-h-0 bg-base-100">
            <PanelHeader
                kicker={
                    placement.hired_at
                        ? `Placed ${formatDate(placement.hired_at)}`
                        : ""
                }
                badges={headerBadges}
                avatar={{ initials }}
                title={name}
                subtitle={company}
                meta={meta}
                stats={stats}
                onClose={onClose}
            />
            <PanelTabs tabs={TABS} defaultTab="financials">
                {(tab) => {
                    if (tab === "financials")
                        return (
                            <FinancialsTab
                                placement={placement}
                                placementId={placement.id}
                            />
                        );
                    if (tab === "dates")
                        return <DatesTab placement={placement} />;
                    return <SplitsTab placement={placement} />;
                }}
            </PanelTabs>
        </div>
    );
}

/* ─── Financials Tab ───────────────────────────────────────────────────── */

function FinancialsTab({
    placement,
    placementId,
}: {
    placement: Placement;
    placementId: string;
}) {
    const state = placement.state || "unknown";
    const salary = placement.salary || 0;
    const feePercentage = placement.fee_percentage || 0;
    const feeAmount = salary * (feePercentage / 100);
    const recruiterShare = placement.recruiter_share || 0;
    const platformShare = feeAmount - recruiterShare;

    const billing = usePlacementBilling(placementId);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const table = buildFinancialsTable(
            placement,
            billing.invoice,
            billing.payoutTransactions,
        );
        await copyToClipboard(table);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const table = buildFinancialsTable(
            placement,
            billing.invoice,
            billing.payoutTransactions,
        );
        const name = candidateName(placement)
            .replace(/\s+/g, "-")
            .toLowerCase();
        downloadCsv(table, `placement-${name}-financials.csv`);
    };

    return (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-8 p-6">
            {/* Export toolbar */}
            <div className="flex items-center gap-2 justify-end">
                <button
                    onClick={handleCopy}
                    className="btn btn-sm btn-ghost text-base-content/50"
                    title="Copy to clipboard (Excel-friendly)"
                >
                    <i
                        className={`fa-duotone fa-regular ${copied ? "fa-check" : "fa-clipboard"} mr-1`}
                    />
                    {copied ? "Copied!" : "Copy"}
                </button>
                <button
                    onClick={handleDownload}
                    className="btn btn-sm btn-ghost text-base-content/50"
                    title="Download CSV"
                >
                    <i className="fa-duotone fa-regular fa-file-csv mr-1" />
                    CSV
                </button>
            </div>

            {/* Financial stats grid */}
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                {[
                    { l: "Salary", v: formatCurrency(salary) },
                    { l: "Fee Rate", v: `${feePercentage}%` },
                    {
                        l: "Your Share",
                        v: formatCurrency(recruiterShare),
                        accent: true,
                    },
                ].map((s) => (
                    <div key={s.l} className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            {s.l}
                        </p>
                        <p
                            className={`text-lg font-black tracking-tight ${s.accent ? "text-primary" : ""}`}
                        >
                            {s.v}
                        </p>
                    </div>
                ))}
            </div>

            {/* Commission breakdown */}
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Commission Breakdown
                </p>
                {[
                    {
                        l: "Total Fee",
                        v: formatCurrency(feeAmount),
                        bold: true,
                    },
                    { l: "Recruiter Share", v: formatCurrency(recruiterShare) },
                    { l: "Platform Share", v: formatCurrency(platformShare) },
                ].map((r) => (
                    <div
                        key={r.l}
                        className="flex justify-between text-sm mb-1"
                    >
                        <span className="text-base-content/50">{r.l}</span>
                        <span
                            className={
                                r.bold
                                    ? "font-bold text-primary"
                                    : "font-semibold"
                            }
                        >
                            {r.v}
                        </span>
                    </div>
                ))}
            </div>

            {/* Guarantee period */}
            {placement.guarantee_days != null && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Guarantee Period
                    </p>
                    <div className="bg-primary/5 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-primary/60 mb-1">
                            Duration
                        </p>
                        <p className="text-base font-bold text-primary">
                            {placement.guarantee_days} days
                        </p>
                    </div>
                </div>
            )}

            {/* Failed info */}
            {state === "failed" && placement.failed_at && (
                <div className="border-t-2 border-base-300 pt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-error mb-3">
                        Placement Failed
                    </p>
                    <p className="text-sm text-base-content/60">
                        Failed on {formatDate(placement.failed_at)}
                    </p>
                </div>
            )}

            {/* Billing pipeline */}
            {billing.loading ? (
                <div className="flex items-center gap-3 py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                    <span className="text-sm text-base-content/40">
                        Loading billing details...
                    </span>
                </div>
            ) : (
                <>
                    <InvoiceSection invoice={billing.invoice} />
                    <PayoutTransactionsSection
                        transactions={billing.payoutTransactions}
                    />
                    <PayoutScheduleSection
                        schedules={billing.payoutSchedules}
                    />
                    <EscrowHoldsSection holds={billing.escrowHolds} />
                </>
            )}
        </div>
    );
}

/* ─── Dates Tab ────────────────────────────────────────────────────────── */

function DatesTab({ placement }: { placement: Placement }) {
    const dates = [
        { l: "Hired", v: formatDate(placement.hired_at) },
        ...(placement.start_date
            ? [{ l: "Start Date", v: formatDate(placement.start_date) }]
            : []),
        ...(placement.end_date
            ? [{ l: "End Date", v: formatDate(placement.end_date) }]
            : []),
        ...(placement.guarantee_expires_at
            ? [
                  {
                      l: "Guarantee Expires",
                      v: formatDate(placement.guarantee_expires_at),
                  },
              ]
            : []),
    ];

    const info = [
        { l: "Candidate", v: candidateName(placement) },
        { l: "Position", v: jobTitle(placement) },
        { l: "Company", v: companyName(placement) },
        ...(placement.candidate?.email
            ? [{ l: "Email", v: placement.candidate.email }]
            : []),
    ];

    return (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-8 p-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Key Dates
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {dates.map((dt) => (
                        <div key={dt.l} className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                {dt.l}
                            </p>
                            <p className="font-bold text-sm">{dt.v}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Placement Info
                </p>
                <div className="bg-base-200 border border-base-300 divide-y divide-base-300">
                    {info.map((r) => (
                        <div
                            key={r.l}
                            className="flex justify-between px-4 py-3"
                        >
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40">
                                {r.l}
                            </span>
                            <span className="text-sm font-semibold text-right">
                                {r.v}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Splits Tab ───────────────────────────────────────────────────────── */

function SplitsTab({ placement }: { placement: Placement }) {
    const salary = placement.salary || 0;
    const feePercentage = placement.fee_percentage || 0;
    const feeAmount = salary * (feePercentage / 100);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-8 p-6">
            {placement.splits && placement.splits.length > 0 ? (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Split Partners
                    </p>
                    <ul className="space-y-2">
                        {placement.splits.map((split) => {
                            const name =
                                split.recruiter?.user?.name ||
                                split.role.replace(/_/g, " ");
                            const roleLabel = split.role.replace(/_/g, " ");
                            return (
                                <li
                                    key={split.id}
                                    className="flex items-center justify-between text-base-content/70 border-b border-base-200 pb-2"
                                >
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-check text-primary text-sm" />
                                        <span className="text-sm font-semibold">
                                            {name}
                                            <span className="text-base-content/40 capitalize">
                                                {" "}
                                                ({roleLabel})
                                            </span>
                                        </span>
                                    </span>
                                    <span className="text-sm font-bold">
                                        {split.split_percentage}% &middot;{" "}
                                        {formatCurrency(split.split_amount)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center p-12">
                    <div className="text-center">
                        <i className="fa-duotone fa-regular fa-pie-chart text-3xl text-base-content/20 mb-4 block" />
                        <h3 className="text-lg font-black tracking-tight mb-2">
                            No Split Partners
                        </h3>
                        <p className="text-sm text-base-content/40">
                            This placement has no split arrangements.
                        </p>
                    </div>
                </div>
            )}

            {/* Fee summary */}
            <div className="bg-base-200 border border-base-300 p-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/50">Total Fee</span>
                    <span className="font-bold text-primary">
                        {formatCurrency(feeAmount)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-base-content/50">Fee Rate</span>
                    <span className="font-semibold">
                        {feePercentage}% of {formatCurrency(salary)}
                    </span>
                </div>
            </div>
        </div>
    );
}
