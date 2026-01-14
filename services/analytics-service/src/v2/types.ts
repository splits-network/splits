import { z } from 'zod';

// ===================================
// Event Types
// ===================================

export const EventTypeSchema = z.enum([
    'application.created',
    'application.stage_changed',
    'application.accepted',
    'placement.created',
    'placement.activated',
    'placement.completed',
    'job.created',
    'job.status_changed',
    'candidate.created',
    'candidate.verified',
    'recruiter.activated',
    'proposal.created',
    'proposal.accepted',
]);

export type EventType = z.infer<typeof EventTypeSchema>;

export const EntityTypeSchema = z.enum([
    'application',
    'placement',
    'job',
    'candidate',
    'recruiter',
    'company',
    'proposal',
]);

export type EntityType = z.infer<typeof EntityTypeSchema>;

export interface AnalyticsEvent {
    id: string;
    event_type: EventType;
    entity_type: EntityType;
    entity_id: string;
    user_id: string;
    user_role?: string;
    organization_id?: string;
    metadata: Record<string, any>;
    created_at: Date;
}

// ===================================
// Metric Types
// ===================================

export const MetricTypeSchema = z.enum([
    // Recruiter metrics
    'active_roles',
    'candidates_in_process',
    'offers_pending',
    'placements_this_month',
    'placements_this_year',
    'total_earnings_ytd',
    'pending_payouts',

    // Candidate metrics
    'total_applications',
    'active_applications',
    'interviews_scheduled',
    'offers_received',

    // Company metrics
    'total_applications_count',
    'interviews_scheduled_count',
    'offers_extended_count',
    'placements_count',
    'avg_time_to_hire_days',
    'active_recruiters',

    // Activity metrics
    'applications_submitted',
    'placements_completed',
    'jobs_posted',
    'candidates_verified',
]);

export type MetricType = z.infer<typeof MetricTypeSchema>;

export const TimeBucketSchema = z.enum(['hour', 'day', 'month']);
export type TimeBucket = z.infer<typeof TimeBucketSchema>;

export interface Metric {
    id: string;
    metric_type: MetricType;
    time_bucket: TimeBucket;
    time_value: Date;
    dimension_user_id?: string;
    dimension_company_id?: string;
    dimension_recruiter_id?: string;
    value: number;
    metadata?: Record<string, any>;
    created_at: Date;
}

// ===================================
// Stats Request/Response Types
// ===================================

export const StatsScopeSchema = z.enum(['recruiter', 'candidate', 'company', 'platform']);
export type StatsScope = z.infer<typeof StatsScopeSchema>;

export const StatsRangeSchema = z.enum(['7d', '30d', '90d', 'ytd', 'all']);
export type StatsRange = z.infer<typeof StatsRangeSchema>;

export interface RecruiterStats {
    active_roles: number;
    candidates_in_process: number;
    offers_pending: number;
    placements_this_month: number;
    placements_this_year: number;
    total_earnings_ytd: number;
    pending_payouts: number;
}

export interface CandidateStats {
    total_applications: number;
    active_applications: number;
    interviews_scheduled: number;
    offers_received: number;
}

export interface CompanyStats {
    active_roles: number;
    total_applications: number;
    interviews_scheduled: number;
    offers_extended: number;
    placements_this_month: number;
    placements_this_year: number;
    avg_time_to_hire_days: number | null;
    active_recruiters: number;
}

export interface PlatformStats {
    total_active_jobs: number;
    total_active_recruiters: number;
    total_active_companies: number;
    total_applications_30d: number;
    total_placements_30d: number;
    avg_time_to_hire_days: number | null;
}

export type StatsResponse = RecruiterStats | CandidateStats | CompanyStats | PlatformStats;

// ===================================
// Chart Types
// ===================================

export const ChartTypeSchema = z.enum([
    'recruiter-activity',
    'application-trends',
    'placement-trends',
    'role-trends',
    'candidate-trends',
    'time-to-hire-trends',
]);

export type ChartType = z.infer<typeof ChartTypeSchema>;

export const ChartPeriodSchema = z.enum(['3m', '6m', '12m', '24m']);
export type ChartPeriod = z.infer<typeof ChartPeriodSchema>;

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

// ===================================
// Marketplace Health Types
// ===================================

export interface MarketplaceHealthMetrics {
    metric_date: Date;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    avg_time_to_hire_days: number | null;
    hire_rate: number | null;
    placement_completion_rate: number | null;
    avg_recruiter_response_time_hours: number | null;
    total_fees_generated: number;
    total_payouts_processed: number;
    fraud_signals_raised: number;
    disputes_opened: number;
}

// ===================================
// Cache Types
// ===================================

export type CacheTTL = 60 | 300 | 3600; // 1min, 5min, 1hour

export interface CacheOptions {
    ttl: CacheTTL;
    invalidateOn?: EventType[];
}
