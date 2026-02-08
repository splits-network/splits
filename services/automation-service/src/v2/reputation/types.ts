/**
 * Reputation Domain Types
 *
 * Types for the recruiter reputation calculation and scoring system.
 */

/**
 * Raw metrics gathered from the database for reputation calculation.
 */
export interface ReputationMetrics {
    total_submissions: number;
    total_hires: number;
    total_placements: number;
    completed_placements: number;
    failed_placements: number;
    total_collaborations: number;
    avg_response_time_hours: number | null;
}

/**
 * Result of a reputation calculation, including metrics and final score.
 */
export interface CalculationResult {
    metrics: ReputationMetrics;
    final_score: number; // 0-100
}

/**
 * Reputation tier based on score.
 */
export type ReputationTier = 'elite' | 'pro' | 'active' | 'new';

/**
 * The stored recruiter reputation record.
 */
export interface RecruiterReputation {
    recruiter_id: string;
    total_submissions: number;
    total_hires: number;
    hire_rate: number | null;
    total_placements: number;
    completed_placements: number;
    failed_placements: number;
    completion_rate: number | null;
    total_collaborations: number;
    collaboration_rate: number | null;
    avg_response_time_hours: number | null;
    reputation_score: number;
    last_calculated_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Tier change event payload for notifications.
 */
export interface TierChangeEvent {
    recruiter_id: string;
    recruiter_user_id: string;
    old_tier: ReputationTier;
    new_tier: ReputationTier;
    old_score: number;
    new_score: number;
}

/**
 * Get tier from reputation score (0-100).
 */
export function getTierFromScore(score: number): ReputationTier {
    if (score >= 90) return 'elite';
    if (score >= 70) return 'pro';
    if (score >= 40) return 'active';
    return 'new';
}
