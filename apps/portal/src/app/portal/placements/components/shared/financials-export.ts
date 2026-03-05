import type { Placement } from "../../types";
import type {
    PlacementInvoice,
    PayoutTransaction,
} from "../../billing-types";
import {
    candidateName,
    jobTitle,
    companyName,
    formatCurrency,
    formatDate,
} from "./helpers";

/* ─── Build Exportable Table ───────────────────────────────────────────── */

interface TableData {
    headers: string[];
    rows: string[][];
}

export function buildFinancialsTable(
    placement: Placement,
    invoice: PlacementInvoice | null,
    transactions: PayoutTransaction[],
): TableData {
    const salary = placement.salary || 0;
    const feePct = placement.fee_percentage || 0;
    const feeAmount = salary * (feePct / 100);
    const recruiterShare = placement.recruiter_share || 0;
    const platformShare = feeAmount - recruiterShare;

    const headers = [
        "Category",
        "Detail",
        "Value",
    ];

    const rows: string[][] = [
        ["Placement", "Candidate", candidateName(placement)],
        ["Placement", "Job", jobTitle(placement)],
        ["Placement", "Company", companyName(placement)],
        ["Placement", "Salary", formatCurrency(salary)],
        ["Placement", "Fee Rate", `${feePct}%`],
        ["Placement", "Total Fee", formatCurrency(feeAmount)],
        ["Placement", "Recruiter Share", formatCurrency(recruiterShare)],
        ["Placement", "Platform Share", formatCurrency(platformShare)],
        ["Placement", "Guarantee", placement.guarantee_days != null ? `${placement.guarantee_days} days` : "N/A"],
        ["Placement", "Hired", formatDate(placement.hired_at)],
    ];

    if (invoice) {
        rows.push(
            ["Invoice", "Status", invoice.invoice_status],
            ["Invoice", "Amount Due", formatCurrency(invoice.amount_due)],
            ["Invoice", "Amount Paid", formatCurrency(invoice.amount_paid)],
            ["Invoice", "Billing Terms", invoice.billing_terms.replace(/_/g, " ")],
            ["Invoice", "Due Date", invoice.due_date ? formatDate(invoice.due_date) : "N/A"],
            ["Invoice", "Paid Date", invoice.paid_at ? formatDate(invoice.paid_at) : "N/A"],
            ["Invoice", "Funds Available", invoice.funds_available ? "Yes" : "No"],
        );
    }

    for (const tx of transactions) {
        const role = tx.split_role?.replace(/_/g, " ") || "Unknown";
        rows.push([
            "Payout",
            tx.recruiter_name || "Unknown",
            `${role} — ${tx.split_percentage ?? 0}% — ${formatCurrency(tx.amount)} — ${tx.status}`,
        ]);
    }

    return { headers, rows };
}

/* ─── Copy to Clipboard (tab-separated for Excel) ──────────────────────── */

export async function copyToClipboard(table: TableData): Promise<void> {
    const tsv = [
        table.headers.join("\t"),
        ...table.rows.map((r) => r.join("\t")),
    ].join("\n");

    await navigator.clipboard.writeText(tsv);
}

/* ─── Download CSV ─────────────────────────────────────────────────────── */

export function downloadCsv(table: TableData, filename: string): void {
    const escape = (s: string) =>
        s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;

    const csv = [
        table.headers.map(escape).join(","),
        ...table.rows.map((r) => r.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
