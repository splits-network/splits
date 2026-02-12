// Stats domain types for analytics service

export type StatsScope = 'recruiter' | 'candidate' | 'company' | 'platform';

export interface StatsRange {
    label: string;
    from: Date;
    to: Date;
    raw?: string;
}

export interface StatsQueryParams {
    scope?: string;
    type?: string;
    range?: string;
}

export interface RecruiterStatsMetrics {
    active_roles: number;
    candidates_in_process: number;
    offers_pending: number;
    placements_this_month: number;
    placements_this_year: number;
    total_earnings_ytd: number;
    pending_payouts: number;
    pipeline_value: number;
    submissions_mtd: number;
    stale_candidates: number;
    pending_reviews: number;
}

export interface CandidateStatsMetrics {
    total_applications: number;
    active_applications: number;
    interviews_scheduled: number;
    offers_received: number;
}

export interface CompanyStatsMetrics {
    active_roles: number;
    total_applications: number;
    interviews_scheduled: number;
    offers_extended: number;
    placements_this_month: number;
    placements_this_year: number;
    avg_time_to_hire_days: number;
    active_recruiters: number;
}

export interface PlatformStatsMetrics {
    total_users: number;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    total_revenue: number;
}

export interface RecruiterStatsResponse {
    scope: 'recruiter';
    range: {
        label: string;
        from: string;
        to: string;
    };
    metrics: RecruiterStatsMetrics;
}

export interface CandidateStatsResponse {
    scope: 'candidate';
    range: {
        label: string;
        from: string;
        to: string;
    };
    metrics: CandidateStatsMetrics;
}

export interface CompanyStatsResponse {
    scope: 'company';
    range: {
        label: string;
        from: string;
        to: string;
    };
    metrics: CompanyStatsMetrics;
}

export interface PlatformStatsResponse {
    scope: 'platform';
    range: {
        label: string;
        from: string;
        to: string;
    };
    metrics: PlatformStatsMetrics;
}

export type StatsResponse =
    | RecruiterStatsResponse
    | CandidateStatsResponse
    | CompanyStatsResponse
    | PlatformStatsResponse;
