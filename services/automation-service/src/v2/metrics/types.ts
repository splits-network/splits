/**
 * Metrics Domain Types
 */

export interface MarketplaceMetric {
    id: string;
    date: string;
    total_placements: number;
    total_applications: number;
    total_earnings_cents: number;
    avg_placement_duration_days: number | null;
    active_recruiters: number;
    active_jobs: number;
    health_score: number;
    created_at: string;
    updated_at: string;
}

export interface MetricFilters {
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

export type MetricUpdate = Partial<Omit<MarketplaceMetric, 'id' | 'created_at' | 'updated_at'>>;
