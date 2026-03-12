import type { BaselSortOption } from "@splits-network/basel-ui";

export const CODE_STATUS_LABELS: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
};

export const REFERRAL_CODE_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "usage_count", label: "Usage Count" },
];

export interface RecruiterCode {
    id: string;
    code: string;
    label?: string;
    status: "active" | "inactive";
    is_default: boolean;
    created_at: string;
    updated_at: string;
    usage_count?: number;
    expiry_date?: string;
    max_uses?: number;
    uses_remaining?: number;
}

export interface ReferralCodeFilters {
    status?: string;
    is_default?: string;
    expiry_status?: string;
    has_usage_limit?: string;
}

export const IS_DEFAULT_LABELS: Record<string, string> = {
    yes: "Default Code",
    no: "Non-Default",
};

export const EXPIRY_STATUS_LABELS: Record<string, string> = {
    active: "Not Expired",
    expired: "Expired",
    no_expiry: "No Expiry Set",
};

export const HAS_USAGE_LIMIT_LABELS: Record<string, string> = {
    yes: "Has Limit",
    no: "Unlimited",
};
