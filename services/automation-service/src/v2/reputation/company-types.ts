/**
 * Company Reputation Domain Types
 *
 * Types for the company reputation calculation and scoring system.
 */

/**
 * Raw metrics gathered from the database for company reputation calculation.
 */
export interface CompanyReputationMetrics {
    total_applications_received: number;
    total_hires: number;
    total_placements: number;
    completed_placements: number;
    failed_placements: number;
    avg_review_time_hours: number | null;
    avg_feedback_time_hours: number | null;
    total_expired_in_company_stages: number;
}

/**
 * Result of a company reputation calculation, including metrics and final score.
 */
export interface CompanyCalculationResult {
    metrics: CompanyReputationMetrics;
    final_score: number; // 0-100
}

/**
 * Reputation tier based on score.
 */
export type CompanyReputationTier = 'elite' | 'pro' | 'active' | 'new';

/**
 * The stored company reputation record.
 */
export interface CompanyReputation {
    company_id: string;
    total_applications_received: number;
    total_hires: number;
    total_placements: number;
    completed_placements: number;
    failed_placements: number;
    hire_rate: number | null;
    completion_rate: number | null;
    avg_review_time_hours: number | null;
    avg_feedback_time_hours: number | null;
    total_expired_in_company_stages: number;
    expiration_rate: number | null;
    reputation_score: number;
    last_calculated_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Tier change event payload for notifications.
 */
export interface CompanyTierChangeEvent {
    company_id: string;
    old_tier: CompanyReputationTier;
    new_tier: CompanyReputationTier;
    old_score: number;
    new_score: number;
}

/**
 * Get tier from company reputation score (0-100).
 */
export function getCompanyTierFromScore(score: number): CompanyReputationTier {
    if (score >= 90) return 'elite';
    if (score >= 70) return 'pro';
    if (score >= 40) return 'active';
    return 'new';
}
