/**
 * Marketplace Metrics Domain Types
 * Matches the marketplace_metrics_daily table schema
 */

export interface MarketplaceMetric {
    id: string;
    metric_date: string;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    avg_time_to_hire_days: number | null;
    hire_rate: number | null;
    placement_completion_rate: number | null;
    avg_recruiter_response_time_hours: number | null;
    total_fees_generated: number | null;
    total_payouts_processed: number | null;
    fraud_signals_raised: number;
    disputes_opened: number;
    created_at: string;
}

export interface MetricFilters {
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

export type MetricUpdate = Partial<Omit<MarketplaceMetric, 'id' | 'created_at'>>;
