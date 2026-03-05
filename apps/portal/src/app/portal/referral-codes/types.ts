export interface RecruiterCode {
    id: string;
    code: string;
    label?: string;
    status: "active" | "inactive";
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
