/**
 * Reputation Calculator
 *
 * Implements the scoring algorithm for recruiter reputation.
 *
 * Score components:
 * - Completion Rate: 35% - completed / (completed + failed), penalize failures
 * - Hire Rate: 25% - hires / submissions, scaled where 25%+ = 100
 * - Collaboration: 15% - Bonus for split placements
 * - Responsiveness: 15% - Based on avg response hours, <4h = 100
 * - Volume Bonus: +0-10 - Additive bonus based on placement count
 *
 * Thresholds:
 * - Min 5 submissions for hire rate (else neutral 50)
 * - Min 3 placements for completion rate (else neutral 50)
 * - New recruiters start at 50 (neutral)
 */

import { ReputationMetrics, CalculationResult } from './types';

// Weight constants
const WEIGHT_COMPLETION = 0.35;
const WEIGHT_HIRE = 0.25;
const WEIGHT_COLLABORATION = 0.15;
const WEIGHT_RESPONSIVENESS = 0.15;

// Threshold constants
const MIN_SUBMISSIONS_FOR_HIRE_RATE = 5;
const MIN_PLACEMENTS_FOR_COMPLETION_RATE = 3;
const NEUTRAL_SCORE = 50;

// Hire rate scaling - 25% hire rate = 100 score
const TARGET_HIRE_RATE = 0.25;

// Response time thresholds (hours)
const EXCELLENT_RESPONSE_HOURS = 4;
const GOOD_RESPONSE_HOURS = 12;
const ACCEPTABLE_RESPONSE_HOURS = 24;
const POOR_RESPONSE_HOURS = 48;

// Volume bonus thresholds
const VOLUME_TIERS = [
    { minPlacements: 50, bonus: 10 },
    { minPlacements: 30, bonus: 7.5 },
    { minPlacements: 15, bonus: 5 },
    { minPlacements: 5, bonus: 2.5 },
];

/**
 * Calculate the reputation score for a recruiter based on their metrics.
 */
export function calculateReputationScore(
    metrics: ReputationMetrics
): CalculationResult {
    const completionScore = calculateCompletionScore(metrics);
    const hireScore = calculateHireScore(metrics);
    const collaborationScore = calculateCollaborationScore(metrics);
    const responsivenessScore = calculateResponsivenessScore(metrics);
    const volumeBonus = calculateVolumeBonus(metrics);

    // Calculate weighted base score (0-100)
    const baseScore =
        completionScore * WEIGHT_COMPLETION +
        hireScore * WEIGHT_HIRE +
        collaborationScore * WEIGHT_COLLABORATION +
        responsivenessScore * WEIGHT_RESPONSIVENESS;

    // Add volume bonus and cap at 100
    const finalScore = Math.min(100, Math.max(0, baseScore + volumeBonus));

    // Round to 1 decimal place
    const roundedScore = Math.round(finalScore * 10) / 10;

    return {
        metrics,
        final_score: roundedScore,
    };
}

/**
 * Calculate completion rate score (0-100).
 * Penalizes failures more heavily.
 */
function calculateCompletionScore(metrics: ReputationMetrics): number {
    const { total_placements, completed_placements, failed_placements } = metrics;

    // Need minimum placements for meaningful rate
    if (total_placements < MIN_PLACEMENTS_FOR_COMPLETION_RATE) {
        return NEUTRAL_SCORE;
    }

    // Calculate raw completion rate
    const successfulPlacements = completed_placements;
    const unsuccessfulPlacements = failed_placements;
    const decidedPlacements = successfulPlacements + unsuccessfulPlacements;

    if (decidedPlacements === 0) {
        return NEUTRAL_SCORE;
    }

    // Base rate
    const completionRate = successfulPlacements / decidedPlacements;

    // Apply penalty multiplier for failures
    // Each failure reduces score more than a simple average would
    const failurePenalty = Math.min(20, failed_placements * 5);

    const score = completionRate * 100 - failurePenalty;

    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate hire rate score (0-100).
 * Scaled so 25% hire rate = 100 score.
 */
function calculateHireScore(metrics: ReputationMetrics): number {
    const { total_submissions, total_hires } = metrics;

    // Need minimum submissions for meaningful rate
    if (total_submissions < MIN_SUBMISSIONS_FOR_HIRE_RATE) {
        return NEUTRAL_SCORE;
    }

    const hireRate = total_hires / total_submissions;

    // Scale: 25% hire rate = 100, 0% = 0
    // Use a non-linear curve to reward higher rates
    const scaledScore = Math.min(100, (hireRate / TARGET_HIRE_RATE) * 100);

    return Math.max(0, scaledScore);
}

/**
 * Calculate collaboration score (0-100).
 * Rewards recruiters who work well with others.
 */
function calculateCollaborationScore(metrics: ReputationMetrics): number {
    const { total_placements, total_collaborations } = metrics;

    // No placements = neutral score
    if (total_placements === 0) {
        return NEUTRAL_SCORE;
    }

    // Collaboration rate
    const collabRate = total_collaborations / total_placements;

    // Scale: 50% collaboration rate = 100, 0% = 50 (neutral)
    // Collaborating is good but not required
    const score = NEUTRAL_SCORE + collabRate * 100;

    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate responsiveness score (0-100).
 * Based on average response time to info requests.
 */
function calculateResponsivenessScore(metrics: ReputationMetrics): number {
    const { avg_response_time_hours } = metrics;

    // No response time data = neutral score
    if (avg_response_time_hours === null) {
        return NEUTRAL_SCORE;
    }

    // Scoring based on response time bands
    if (avg_response_time_hours <= EXCELLENT_RESPONSE_HOURS) {
        return 100;
    }
    if (avg_response_time_hours <= GOOD_RESPONSE_HOURS) {
        // Linear interpolation from 100 to 80
        const ratio =
            (avg_response_time_hours - EXCELLENT_RESPONSE_HOURS) /
            (GOOD_RESPONSE_HOURS - EXCELLENT_RESPONSE_HOURS);
        return 100 - ratio * 20;
    }
    if (avg_response_time_hours <= ACCEPTABLE_RESPONSE_HOURS) {
        // Linear interpolation from 80 to 60
        const ratio =
            (avg_response_time_hours - GOOD_RESPONSE_HOURS) /
            (ACCEPTABLE_RESPONSE_HOURS - GOOD_RESPONSE_HOURS);
        return 80 - ratio * 20;
    }
    if (avg_response_time_hours <= POOR_RESPONSE_HOURS) {
        // Linear interpolation from 60 to 30
        const ratio =
            (avg_response_time_hours - ACCEPTABLE_RESPONSE_HOURS) /
            (POOR_RESPONSE_HOURS - ACCEPTABLE_RESPONSE_HOURS);
        return 60 - ratio * 30;
    }

    // Beyond 48 hours, score drops further
    return Math.max(0, 30 - (avg_response_time_hours - POOR_RESPONSE_HOURS) * 0.5);
}

/**
 * Calculate volume bonus (0-10).
 * Additive bonus based on total placements.
 */
function calculateVolumeBonus(metrics: ReputationMetrics): number {
    const { completed_placements } = metrics;

    for (const tier of VOLUME_TIERS) {
        if (completed_placements >= tier.minPlacements) {
            return tier.bonus;
        }
    }

    return 0;
}
