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
    stale_roles: number;
    applications_mtd: number;
    trends?: {
        active_roles?: number;
        total_applications?: number;
        placements_this_year?: number;
    };
}

export interface PlatformStatsMetrics {
    // Core counts
    total_users: number;
    total_recruiters: number;
    total_companies: number;
    total_candidates: number;
    total_jobs: number;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    total_revenue: number;
    // Growth
    new_signups_mtd: number;
    placements_this_month: number;
    // Operations
    pending_payouts_count: number;
    pending_payouts_amount: number;
    active_fraud_signals: number;
    active_escrow_holds: number;
    active_escrow_amount: number;
    pending_recruiter_approvals: number;
    // Financial
    total_payouts_processed_ytd: number;
    avg_fee_percentage: number;
    avg_placement_value: number;
    // Subscriptions
    active_subscriptions: number;
    trialing_subscriptions: number;
    past_due_subscriptions: number;
    canceled_subscriptions: number;
    // Distribution breakdowns
    recruiter_statuses: { active: number; pending: number; suspended: number };
    job_statuses: { active: number; closed: number; expired: number; draft: number };
    // Trends (% change vs previous period)
    trends?: {
        active_jobs?: number;
        active_recruiters?: number;
        total_applications?: number;
        total_placements?: number;
        total_revenue?: number;
    };
}

export interface PlatformActivityEvent {
    type: 'placement' | 'recruiter_join' | 'company_join' | 'fraud_alert' | 'application' | 'payout';
    title: string;
    description: string;
    href: string;
    created_at: string;
}

export interface TopPerformer {
    recruiter_id: string;
    recruiter_name: string;
    placement_count: number;
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

/**
 * Online users data from Redis presence keys (set by chat-gateway)
 */
export interface OnlineUsersData {
    total_online: number;
    by_status: {
        online: number;
        idle: number;
    };
    timestamp: string;
}
