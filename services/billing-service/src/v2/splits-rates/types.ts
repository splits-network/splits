/**
 * Splits Rates Domain Types
 *
 * Database-driven commission rates per plan tier.
 * Replaces hardcoded COMMISSION_RATES from shared-types.
 */

export interface SplitsRate {
    id: string;
    plan_id: string;
    candidate_recruiter_rate: number;  // 0-100
    job_owner_rate: number;
    company_recruiter_rate: number;
    candidate_sourcer_rate: number;
    company_sourcer_rate: number;
    effective_from: string;
    effective_to: string | null;
    created_at: string;
    updated_at: string;
}

export interface SplitsRateWithPlan extends SplitsRate {
    plan_tier: string;
    plan_name: string;
}

export interface SplitsRateCreateInput {
    plan_id: string;
    candidate_recruiter_rate: number;
    job_owner_rate: number;
    company_recruiter_rate: number;
    candidate_sourcer_rate: number;
    company_sourcer_rate: number;
}

export interface SplitsRateUpdateInput {
    candidate_recruiter_rate: number;
    job_owner_rate: number;
    company_recruiter_rate: number;
    candidate_sourcer_rate: number;
    company_sourcer_rate: number;
}

export interface SplitsRateFilters {
    plan_id?: string;
    active_only?: boolean;
}
