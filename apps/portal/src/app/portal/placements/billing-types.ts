/* ─── Placement Billing Types ──────────────────────────────────────────── */

/** Invoice status from Stripe */
export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface PlacementInvoice {
    id: string;
    placement_id: string;
    stripe_invoice_number: string | null;
    invoice_status: InvoiceStatus;
    amount_due: number;
    amount_paid: number;
    currency: string;
    billing_terms: "immediate" | "net_30" | "net_60" | "net_90";
    due_date: string | null;
    paid_at: string | null;
    funds_available: boolean;
    funds_available_at: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf_url: string | null;
    created_at: string;
}

/** Payout transaction status */
export type TransactionStatus = "pending" | "processing" | "paid" | "failed" | "reversed" | "on_hold";

/** Payout role in placement split */
export type PayoutRole =
    | "candidate_recruiter"
    | "company_recruiter"
    | "job_owner"
    | "candidate_sourcer"
    | "company_sourcer";

export interface PayoutTransaction {
    id: string;
    placement_id: string;
    recruiter_id: string;
    amount: number;
    status: TransactionStatus;
    transaction_type: "member_payout" | "firm_admin_take" | null;
    completed_at: string | null;
    failed_at: string | null;
    failure_reason: string | null;
    recruiter_name: string | null;
    split_role: PayoutRole | null;
    split_percentage: number | null;
}

/** Payout schedule status */
export type ScheduleStatus =
    | "scheduled" | "triggered" | "cancelled"
    | "pending" | "processing" | "processed" | "failed";

export interface PayoutSchedule {
    id: string;
    placement_id: string;
    scheduled_date: string;
    guarantee_completion_date: string | null;
    trigger_event: string;
    status: ScheduleStatus;
    processed_at: string | null;
    created_at: string;
}

/** Escrow hold status */
export type EscrowHoldStatus = "active" | "released" | "cancelled";

export interface EscrowHold {
    id: string;
    placement_id: string;
    hold_amount: number;
    hold_reason: string;
    held_at: string;
    release_scheduled_date: string;
    released_at: string | null;
    status: EscrowHoldStatus;
}
