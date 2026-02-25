/**
 * Company Reputation Calculator
 *
 * Scoring algorithm for company reputation.
 *
 * Score components:
 * - Completion Rate: 25% - completed / (completed + failed) placements
 * - Hire-through Rate: 25% - hires / applications received
 * - Review Responsiveness: 20% - Based on avg_review_time_hours
 * - Feedback Responsiveness: 15% - Based on avg_feedback_time_hours
 * - Expiration Accountability: 15% - (1 - expiration_rate) * 100
 * - Volume Bonus: +0-10 - Additive bonus based on completed placement count
 *
 * Thresholds:
 * - Min 3 placements for completion rate (else neutral 50)
 * - Min 10 applications received for hire rate (else neutral 50)
 * - Min 5 applications in company stages for expiration (else neutral 50)
 * - New companies start at 50 (neutral)
 */

import { CompanyReputationMetrics, CompanyCalculationResult } from './company-types';

// Weight constants
const WEIGHT_COMPLETION = 0.25;
const WEIGHT_HIRE = 0.25;
const WEIGHT_REVIEW = 0.20;
const WEIGHT_FEEDBACK = 0.15;
const WEIGHT_EXPIRATION = 0.15;

// Threshold constants
const MIN_APPLICATIONS_FOR_HIRE_RATE = 10;
const MIN_PLACEMENTS_FOR_COMPLETION_RATE = 3;
const MIN_APPLICATIONS_FOR_EXPIRATION = 5;
const NEUTRAL_SCORE = 50;

// Hire rate scaling - 25% hire rate = 100 score
const TARGET_HIRE_RATE = 0.25;

// Review time thresholds (hours) - company-specific
const EXCELLENT_REVIEW_HOURS = 24;
const GOOD_REVIEW_HOURS = 48;
const ACCEPTABLE_REVIEW_HOURS = 72;
const POOR_REVIEW_HOURS = 168; // 1 week

// Volume bonus thresholds (same as recruiter)
const VOLUME_TIERS = [
    { minPlacements: 50, bonus: 10 },
    { minPlacements: 30, bonus: 7.5 },
    { minPlacements: 15, bonus: 5 },
    { minPlacements: 5, bonus: 2.5 },
];

/**
 * Calculate the reputation score for a company based on their metrics.
 */
export function calculateCompanyReputationScore(
    metrics: CompanyReputationMetrics
): CompanyCalculationResult {
    const completionScore = calculateCompletionScore(metrics);
    const hireScore = calculateHireScore(metrics);
    const reviewScore = calculateReviewResponsivenessScore(metrics);
    const feedbackScore = calculateFeedbackResponsivenessScore(metrics);
    const expirationScore = calculateExpirationScore(metrics);
    const volumeBonus = calculateVolumeBonus(metrics);

    const baseScore =
        completionScore * WEIGHT_COMPLETION +
        hireScore * WEIGHT_HIRE +
        reviewScore * WEIGHT_REVIEW +
        feedbackScore * WEIGHT_FEEDBACK +
        expirationScore * WEIGHT_EXPIRATION;

    const finalScore = Math.min(100, Math.max(0, baseScore + volumeBonus));
    const roundedScore = Math.round(finalScore * 10) / 10;

    return {
        metrics,
        final_score: roundedScore,
    };
}

/**
 * Completion rate score (0-100).
 */
function calculateCompletionScore(metrics: CompanyReputationMetrics): number {
    const { total_placements, completed_placements, failed_placements } = metrics;

    if (total_placements < MIN_PLACEMENTS_FOR_COMPLETION_RATE) {
        return NEUTRAL_SCORE;
    }

    const decidedPlacements = completed_placements + failed_placements;
    if (decidedPlacements === 0) return NEUTRAL_SCORE;

    const completionRate = completed_placements / decidedPlacements;
    const failurePenalty = Math.min(20, failed_placements * 5);
    const score = completionRate * 100 - failurePenalty;

    return Math.max(0, Math.min(100, score));
}

/**
 * Hire-through rate score (0-100).
 * Measures hires / applications received.
 */
function calculateHireScore(metrics: CompanyReputationMetrics): number {
    const { total_applications_received, total_hires } = metrics;

    if (total_applications_received < MIN_APPLICATIONS_FOR_HIRE_RATE) {
        return NEUTRAL_SCORE;
    }

    const hireRate = total_hires / total_applications_received;
    const scaledScore = Math.min(100, (hireRate / TARGET_HIRE_RATE) * 100);

    return Math.max(0, scaledScore);
}

/**
 * Review responsiveness score (0-100).
 * Measures how fast a company reviews submitted applications.
 */
function calculateReviewResponsivenessScore(metrics: CompanyReputationMetrics): number {
    const { avg_review_time_hours } = metrics;

    if (avg_review_time_hours === null) return NEUTRAL_SCORE;

    return calculateResponsivenessBands(avg_review_time_hours);
}

/**
 * Feedback responsiveness score (0-100).
 * Measures how fast a company provides feedback after review.
 */
function calculateFeedbackResponsivenessScore(metrics: CompanyReputationMetrics): number {
    const { avg_feedback_time_hours } = metrics;

    if (avg_feedback_time_hours === null) return NEUTRAL_SCORE;

    return calculateResponsivenessBands(avg_feedback_time_hours);
}

/**
 * Company responsiveness scoring bands.
 * <=24h = 100, 24-48h = 80, 48-72h = 60, 72-168h = 30, >168h declining
 */
function calculateResponsivenessBands(hours: number): number {
    if (hours <= EXCELLENT_REVIEW_HOURS) return 100;

    if (hours <= GOOD_REVIEW_HOURS) {
        const ratio = (hours - EXCELLENT_REVIEW_HOURS) / (GOOD_REVIEW_HOURS - EXCELLENT_REVIEW_HOURS);
        return 100 - ratio * 20;
    }

    if (hours <= ACCEPTABLE_REVIEW_HOURS) {
        const ratio = (hours - GOOD_REVIEW_HOURS) / (ACCEPTABLE_REVIEW_HOURS - GOOD_REVIEW_HOURS);
        return 80 - ratio * 20;
    }

    if (hours <= POOR_REVIEW_HOURS) {
        const ratio = (hours - ACCEPTABLE_REVIEW_HOURS) / (POOR_REVIEW_HOURS - ACCEPTABLE_REVIEW_HOURS);
        return 60 - ratio * 30;
    }

    // Beyond 168 hours (1 week), score drops further
    return Math.max(0, 30 - (hours - POOR_REVIEW_HOURS) * 0.2);
}

/**
 * Expiration accountability score (0-100).
 * Companies with 0% expiration = 100, 100% expiration = 0.
 */
function calculateExpirationScore(metrics: CompanyReputationMetrics): number {
    const { total_applications_received, total_expired_in_company_stages } = metrics;

    if (total_applications_received < MIN_APPLICATIONS_FOR_EXPIRATION) {
        return NEUTRAL_SCORE;
    }

    const expirationRate = total_expired_in_company_stages / total_applications_received;
    return Math.max(0, Math.min(100, (1 - expirationRate) * 100));
}

/**
 * Volume bonus (0-10).
 */
function calculateVolumeBonus(metrics: CompanyReputationMetrics): number {
    const { completed_placements } = metrics;

    for (const tier of VOLUME_TIERS) {
        if (completed_placements >= tier.minPlacements) {
            return tier.bonus;
        }
    }

    return 0;
}
