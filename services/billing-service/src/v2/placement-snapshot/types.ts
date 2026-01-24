export interface PlacementSnapshot {
    id: string;
    placement_id: string;

    // Role IDs for all 5 commission-earning roles
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;

    // Commission rates (percentages as decimals, e.g., 0.15 = 15%)
    candidate_recruiter_rate: number | null;
    company_recruiter_rate: number | null;
    job_owner_rate: number | null;
    candidate_sourcer_rate: number | null;
    company_sourcer_rate: number | null;

    // Fee calculation
    total_placement_fee: number;
    subscription_tier: string;

    // Timestamps
    created_at: string;
}

export interface PlacementSnapshotCreate {
    placement_id: string;

    // Attribution roles
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;

    // Fee information
    total_placement_fee: number;
    subscription_tier: 'premium' | 'paid' | 'free';
}

export interface PlacementSnapshotFilters {
    placement_id?: string;
    recruiter_id?: string;  // For filtering by any role ID
    subscription_tier?: string;
}
