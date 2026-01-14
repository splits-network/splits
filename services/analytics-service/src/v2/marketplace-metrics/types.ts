/**
 * Marketplace Metrics Domain Types
 * Migrated from automation-service to analytics-service
 */

import { StandardListParams } from '@splits-network/shared-types';

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

export interface MetricFilters extends StandardListParams {
    date_from?: string;
    date_to?: string;
}

export type MetricUpdate = Partial<Omit<MarketplaceMetric, 'id' | 'created_at' | 'updated_at'>>;

export interface CreateMetricInput {
    date: string;
    total_placements: number;
    total_applications: number;
    total_earnings_cents: number;
    avg_placement_duration_days?: number | null;
    active_recruiters: number;
    active_jobs: number;
    health_score: number;
}
