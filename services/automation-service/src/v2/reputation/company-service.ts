/**
 * Company Reputation Service
 *
 * Business logic for company reputation calculation, including tier change
 * detection and event publishing.
 */

import { CompanyReputationRepository } from './company-repository';
import { calculateCompanyReputationScore } from './company-calculator';
import { getCompanyTierFromScore, CompanyTierChangeEvent, CompanyReputation } from './company-types';
import { IEventPublisher } from '../shared/events';
import { Logger } from '@splits-network/shared-logging';

export class CompanyReputationService {
    constructor(
        private repository: CompanyReputationRepository,
        private eventPublisher: IEventPublisher | null,
        private logger: Logger
    ) {}

    /**
     * Recalculate reputation for a single company.
     * Detects tier changes and publishes events.
     */
    async recalculateForCompany(companyId: string): Promise<CompanyReputation> {
        this.logger.info({ companyId }, 'Recalculating company reputation');

        const currentReputation = await this.repository.getReputation(companyId);
        const currentScore = currentReputation?.reputation_score ?? 50;
        const currentTier = getCompanyTierFromScore(currentScore);

        const metrics = await this.repository.gatherMetrics(companyId);
        const result = calculateCompanyReputationScore(metrics);

        const newReputation = await this.repository.upsertReputation(
            companyId,
            result.metrics,
            result.final_score
        );

        const newTier = getCompanyTierFromScore(result.final_score);

        this.logger.info(
            {
                companyId,
                oldScore: currentScore,
                newScore: result.final_score,
                oldTier: currentTier,
                newTier,
            },
            'Company reputation recalculated'
        );

        if (currentTier !== newTier) {
            await this.handleTierChange(
                companyId,
                currentTier,
                newTier,
                currentScore,
                result.final_score
            );
        }

        return newReputation;
    }

    /**
     * Handle a tier change by publishing an event.
     */
    private async handleTierChange(
        companyId: string,
        oldTier: string,
        newTier: string,
        oldScore: number,
        newScore: number
    ): Promise<void> {
        const event: CompanyTierChangeEvent = {
            company_id: companyId,
            old_tier: oldTier as CompanyTierChangeEvent['old_tier'],
            new_tier: newTier as CompanyTierChangeEvent['new_tier'],
            old_score: oldScore,
            new_score: newScore,
        };

        this.logger.info(
            { companyId, oldTier, newTier, oldScore, newScore },
            'Company tier change detected, publishing event'
        );

        if (this.eventPublisher) {
            await this.eventPublisher.publish('company_reputation.tier_changed', event);
        }
    }

    /**
     * Recalculate reputation for all companies (batch job).
     */
    async batchRecalculateAll(): Promise<{
        total: number;
        success: number;
        errors: number;
    }> {
        const companyIds = await this.repository.getAllCompanyIds();
        this.logger.info({ count: companyIds.length }, 'Starting company batch recalculation');

        let success = 0;
        let errors = 0;

        for (const companyId of companyIds) {
            try {
                await this.recalculateForCompany(companyId);
                success++;
            } catch (error) {
                this.logger.error(
                    { companyId, error },
                    'Failed to recalculate company reputation'
                );
                errors++;
            }
        }

        this.logger.info(
            { total: companyIds.length, success, errors },
            'Company batch recalculation completed'
        );

        return { total: companyIds.length, success, errors };
    }

    /**
     * Handle a placement event and recalculate for the company.
     */
    async handlePlacementEvent(placementId: string): Promise<void> {
        this.logger.info({ placementId }, 'Handling placement event for company reputation');

        const companyId = await this.repository.getCompanyIdForPlacement(placementId);
        if (!companyId) {
            this.logger.warn({ placementId }, 'Cannot find company for placement');
            return;
        }

        try {
            await this.recalculateForCompany(companyId);
        } catch (error) {
            this.logger.error(
                { companyId, placementId, error },
                'Failed to recalculate company reputation after placement event'
            );
        }
    }

    /**
     * Handle an application hire event and recalculate for the company.
     */
    async handleHireEvent(jobId: string): Promise<void> {
        this.logger.info({ jobId }, 'Handling hire event for company reputation');

        const companyId = await this.repository.getCompanyIdForJob(jobId);
        if (!companyId) {
            this.logger.warn({ jobId }, 'Cannot find company for job');
            return;
        }

        try {
            await this.recalculateForCompany(companyId);
        } catch (error) {
            this.logger.error(
                { companyId, jobId, error },
                'Failed to recalculate company reputation after hire event'
            );
        }
    }

    /**
     * Handle an application expiration event and recalculate for the company.
     */
    async handleExpirationEvent(jobId: string): Promise<void> {
        this.logger.info({ jobId }, 'Handling expiration event for company reputation');

        const companyId = await this.repository.getCompanyIdForJob(jobId);
        if (!companyId) {
            this.logger.warn({ jobId }, 'Cannot find company for job');
            return;
        }

        try {
            await this.recalculateForCompany(companyId);
        } catch (error) {
            this.logger.error(
                { companyId, jobId, error },
                'Failed to recalculate company reputation after expiration event'
            );
        }
    }
}
