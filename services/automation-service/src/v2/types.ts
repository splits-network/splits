/**
 * V2 Shared Types - Automation Service
 * Type definitions for matches, fraud signals, automation rules, and metrics
 */

// ============================================
// CANDIDATE JOB MATCHES
// ============================================

export interface CandidateJobMatch {
    id: string;
    candidate_id: string;
    job_id: string;
    match_score: number; // 0-100
    match_reason: string;
    skills_match: Record<string, any>;
    experience_match: Record<string, any>;
    location_match: Record<string, any>;
    status: 'pending_review' | 'approved' | 'rejected' | 'applied';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MatchFilters {
    candidate_id?: string;
    job_id?: string;
    status?: string;
    min_score?: number;
}

export type MatchUpdate = Partial<Omit<CandidateJobMatch, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// FRAUD SIGNALS
// ============================================

export interface FraudSignal {
    id: string;
    event_id: string;
    event_type: string;
    entity_type: 'recruiter' | 'candidate' | 'application' | 'placement';
    entity_id: string;
    signal_type: string; // e.g., 'duplicate_submission', 'rapid_applications', 'unusual_pattern'
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    status: 'open' | 'reviewing' | 'resolved' | 'false_positive';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FraudSignalFilters {
    entity_type?: string;
    entity_id?: string;
    severity?: string;
    status?: string;
    signal_type?: string;
}

export type FraudSignalUpdate = Partial<Omit<FraudSignal, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// AUTOMATION RULES
// ============================================

export interface AutomationRule {
    id: string;
    name: string;
    description: string | null;
    trigger_type: string; // e.g., 'application_created', 'stage_advanced'
    condition: Record<string, any>;
    action: Record<string, any>;
    status: 'active' | 'inactive' | 'archived';
    requires_approval: boolean;
    created_at: string;
    updated_at: string;
}

export interface RuleFilters {
    trigger_type?: string;
    status?: string;
}

export type RuleUpdate = Partial<Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// METRICS
// ============================================

export interface MarketplaceMetric {
    id: string;
    date: string;
    total_placements: number;
    total_applications: number;
    total_earnings_cents: number;
    avg_placement_duration_days: number | null;
    active_recruiters: number;
    active_jobs: number;
    health_score: number; // 0-100
    created_at: string;
    updated_at: string;
}

export interface MetricFilters {
    date_from?: string;
    date_to?: string;
}

export type MetricUpdate = Partial<Omit<MarketplaceMetric, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// PAGINATION
// ============================================

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
