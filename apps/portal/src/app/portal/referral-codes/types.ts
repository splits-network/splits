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
}
