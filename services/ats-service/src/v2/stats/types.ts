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

export type StatsResponse = RecruiterStatsResponse;
