/**
 * Basel placements types — self-contained (no cross-reference to original).
 * Imports the base Placement type from shared-types and extends it
 * with API-enriched fields.
 */
import type { Placement as BasePlacement } from "@splits-network/shared-types";
import type { BaselSortOption } from "@splits-network/basel-ui";

export interface PlacementSplit {
    id: string;
    role: string;
    split_percentage: number;
    split_amount: number;
    recruiter_id: string;
    recruiter?: {
        id: string;
        user?: {
            name: string;
        };
    };
}

export interface Placement extends Omit<BasePlacement, "hired_at" | "created_at" | "updated_at" | "start_date" | "end_date" | "guarantee_expires_at" | "failed_at"> {
    hired_at: string;
    created_at: string;
    updated_at: string;
    start_date?: string;
    end_date?: string;
    guarantee_expires_at?: string;
    failed_at?: string;
    failure_date?: string;
    status?: string;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
        company?: {
            id: string;
            name: string;
            logo_url?: string;
            identity_organization_id?: string;
        };
    };
    splits?: PlacementSplit[];
}

export interface PlacementFilters {
    status?: string;
    salary_range?: string;
    fee_range?: string;
    fee_amount_range?: string;
    guarantee_status?: string;
    is_replacement?: string;
    has_started?: string;
    invoice_status?: string;
    payout_status?: string;
}

export const PLACEMENT_STATUS_LABELS: Record<string, string> = {
    hired: "Hired",
    active: "Active",
    completed: "Completed",
    failed: "Failed",
};

export const SALARY_RANGE_LABELS: Record<string, string> = {
    under_50k: "Under $50k",
    "50k_100k": "$50k – $100k",
    "100k_150k": "$100k – $150k",
    "150k_200k": "$150k – $200k",
    over_200k: "$200k+",
};

export const FEE_RANGE_LABELS: Record<string, string> = {
    under_15: "Under 15%",
    "15_20": "15% – 20%",
    "20_25": "20% – 25%",
    over_25: "25%+",
};

export const FEE_AMOUNT_LABELS: Record<string, string> = {
    under_10k: "Under $10k",
    "10k_25k": "$10k – $25k",
    "25k_50k": "$25k – $50k",
    over_50k: "$50k+",
};

export const GUARANTEE_STATUS_LABELS: Record<string, string> = {
    in_guarantee: "In Guarantee",
    expiring_soon: "Expiring Soon",
    expired: "Expired",
    no_guarantee: "No Guarantee",
};

export const IS_REPLACEMENT_LABELS: Record<string, string> = {
    yes: "Replacement",
    no: "Original",
};

export const HAS_STARTED_LABELS: Record<string, string> = {
    yes: "Started",
    no: "Not Started",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
    paid: "Paid",
    open: "Open",
    draft: "Draft",
    no_invoice: "No Invoice",
};

export const PAYOUT_STATUS_LABELS: Record<string, string> = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    no_payouts: "No Payouts",
};

export const PLACEMENT_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "hired_at", label: "Hire Date" },
    { value: "status", label: "Status" },
];
