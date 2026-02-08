/**
 * Reputation Service
 *
 * Business logic for reputation calculation, including tier change detection
 * and event publishing.
 */

import { ReputationRepository } from './repository';
import { calculateReputationScore } from './calculator';
import { getTierFromScore, TierChangeEvent, RecruiterReputation } from './types';
import { EventPublisher } from '../shared/events';
import { Logger } from '@splits-network/shared-logging';

export class ReputationService {
    constructor(
        private repository: ReputationRepository,
        private eventPublisher: EventPublisher | null,
        private logger: Logger
    ) {}

    /**
     * Recalculate reputation for a single recruiter.
     * Detects tier changes and publishes events.
     */
    async recalculateForRecruiter(recruiterId: string): Promise<RecruiterReputation> {
        this.logger.info({ recruiterId }, 'Recalculating reputation');

        // Get current reputation (if exists) to detect tier changes
        const currentReputation = await this.repository.getReputation(recruiterId);
        const currentScore = currentReputation?.reputation_score ?? 50;
        const currentTier = getTierFromScore(currentScore);

        // Gather fresh metrics
        const metrics = await this.repository.gatherMetrics(recruiterId);

        // Calculate new score
        const result = calculateReputationScore(metrics);

        // Upsert the new reputation
        const newReputation = await this.repository.upsertReputation(
            recruiterId,
            result.metrics,
            result.final_score
        );

        const newTier = getTierFromScore(result.final_score);

        this.logger.info(
            {
                recruiterId,
                oldScore: currentScore,
                newScore: result.final_score,
                oldTier: currentTier,
                newTier,
            },
            'Reputation recalculated'
        );

        // Check for tier change
        if (currentTier !== newTier) {
            await this.handleTierChange(
                recruiterId,
                currentTier,
                newTier,
                currentScore,
                result.final_score
            );
        }

        return newReputation;
    }

    /**
     * Handle a tier change by publishing an event for notifications.
     */
    private async handleTierChange(
        recruiterId: string,
        oldTier: string,
        newTier: string,
        oldScore: number,
        newScore: number
    ): Promise<void> {
        // Get the recruiter's user_id for notifications
        const recruiterUserId = await this.repository.getRecruiterUserId(recruiterId);

        if (!recruiterUserId) {
            this.logger.warn({ recruiterId }, 'Cannot find user_id for recruiter, skipping tier change event');
            return;
        }

        const event: TierChangeEvent = {
            recruiter_id: recruiterId,
            recruiter_user_id: recruiterUserId,
            old_tier: oldTier as TierChangeEvent['old_tier'],
            new_tier: newTier as TierChangeEvent['new_tier'],
            old_score: oldScore,
            new_score: newScore,
        };

        this.logger.info(
            {
                recruiterId,
                oldTier,
                newTier,
                oldScore,
                newScore,
            },
            'Tier change detected, publishing event'
        );

        if (this.eventPublisher) {
            await this.eventPublisher.publish('reputation.tier_changed', event);
        }
    }

    /**
     * Recalculate reputation for all recruiters.
     * Used for batch jobs.
     */
    async batchRecalculateAll(): Promise<{
        total: number;
        success: number;
        errors: number;
    }> {
        const recruiterIds = await this.repository.getAllRecruiterIds();
        this.logger.info({ count: recruiterIds.length }, 'Starting batch recalculation');

        let success = 0;
        let errors = 0;

        for (const recruiterId of recruiterIds) {
            try {
                await this.recalculateForRecruiter(recruiterId);
                success++;
            } catch (error) {
                this.logger.error(
                    { recruiterId, error },
                    'Failed to recalculate reputation'
                );
                errors++;
            }
        }

        this.logger.info(
            { total: recruiterIds.length, success, errors },
            'Batch recalculation completed'
        );

        return {
            total: recruiterIds.length,
            success,
            errors,
        };
    }

    /**
     * Handle a placement event and recalculate for all involved recruiters.
     */
    async handlePlacementEvent(placementId: string): Promise<void> {
        this.logger.info({ placementId }, 'Handling placement event');

        const recruiterIds =
            await this.repository.getRecruitersForPlacement(placementId);

        this.logger.info(
            { placementId, recruiterCount: recruiterIds.length },
            'Found recruiters for placement'
        );

        for (const recruiterId of recruiterIds) {
            try {
                await this.recalculateForRecruiter(recruiterId);
            } catch (error) {
                this.logger.error(
                    { recruiterId, placementId, error },
                    'Failed to recalculate reputation after placement event'
                );
            }
        }
    }

    /**
     * Handle an application stage change to 'hired'.
     */
    async handleHireEvent(applicationRecruiterId: string): Promise<void> {
        if (!applicationRecruiterId) {
            this.logger.warn('No recruiter ID for hire event');
            return;
        }

        this.logger.info(
            { recruiterId: applicationRecruiterId },
            'Handling hire event'
        );

        try {
            await this.recalculateForRecruiter(applicationRecruiterId);
        } catch (error) {
            this.logger.error(
                { recruiterId: applicationRecruiterId, error },
                'Failed to recalculate reputation after hire event'
            );
        }
    }
}
