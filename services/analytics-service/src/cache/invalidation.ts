import { CacheManager } from './cache-manager';
import { EventType } from '../v2/types';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('CacheInvalidator');

/**
 * Cache invalidation logic based on domain events
 */
export class CacheInvalidator {
    constructor(private cache: CacheManager) { }

    /**
     * Invalidate cache based on event type
     */
    async handleEvent(eventType: EventType, eventData: any): Promise<void> {
        logger.info(`Cache invalidation triggered for event: ${eventType}`);

        switch (eventType) {
            case 'application.created':
            case 'application.stage_changed':
            case 'application.accepted':
                await this.handleApplicationEvent(eventData);
                break;

            case 'placement.created':
            case 'placement.activated':
            case 'placement.completed':
                await this.handlePlacementEvent(eventData);
                break;

            case 'job.created':
            case 'job.status_changed':
                await this.handleJobEvent(eventData);
                break;

            case 'candidate.created':
            case 'candidate.verified':
                await this.handleCandidateEvent(eventData);
                break;

            case 'recruiter.activated':
                await this.handleRecruiterEvent(eventData);
                break;

            case 'proposal.created':
            case 'proposal.accepted':
                await this.handleProposalEvent(eventData);
                break;

            default:
                logger.warn(`No cache invalidation handler for event type: ${eventType}`);
        }
    }

    private async handleApplicationEvent(data: any): Promise<void> {
        // Invalidate recruiter stats
        if (data.recruiterId) {
            await this.cache.invalidateStats('recruiter', data.recruiterId);
        }

        // Invalidate candidate stats
        if (data.candidateId) {
            await this.cache.invalidateStats('candidate', data.candidateId);
        }

        // Invalidate company stats
        if (data.companyId) {
            await this.cache.invalidateCompany(data.companyId);
        }

        // Invalidate application charts
        await this.cache.invalidateCharts('application-trends');
        await this.cache.invalidateCharts('recruiter-activity');
    }

    private async handlePlacementEvent(data: any): Promise<void> {
        // Invalidate recruiter stats (earnings, placements)
        if (data.recruiterId) {
            await this.cache.invalidateStats('recruiter', data.recruiterId);
        }

        // Invalidate company stats
        if (data.companyId) {
            await this.cache.invalidateCompany(data.companyId);
        }

        // Invalidate placement charts
        await this.cache.invalidateCharts('placement-trends');
        await this.cache.invalidateCharts('recruiter-activity');
        await this.cache.invalidateCharts('time-to-hire-trends');
    }

    private async handleJobEvent(data: any): Promise<void> {
        // Invalidate company stats
        if (data.companyId) {
            await this.cache.invalidateCompany(data.companyId);
        }

        // Invalidate role charts
        await this.cache.invalidateCharts('role-trends');
    }

    private async handleCandidateEvent(data: any): Promise<void> {
        // Invalidate candidate stats
        if (data.candidateId) {
            await this.cache.invalidateStats('candidate', data.candidateId);
        }

        // Invalidate candidate charts
        await this.cache.invalidateCharts('candidate-trends');
    }

    private async handleRecruiterEvent(data: any): Promise<void> {
        // Invalidate recruiter stats
        if (data.recruiterId) {
            await this.cache.invalidateStats('recruiter', data.recruiterId);
        }

        // Invalidate recruiter activity charts
        await this.cache.invalidateCharts('recruiter-activity');
    }

    private async handleProposalEvent(data: any): Promise<void> {
        // Invalidate recruiter stats
        if (data.recruiterId) {
            await this.cache.invalidateStats('recruiter', data.recruiterId);
        }

        // Invalidate proposal-related charts (if we add them)
        await this.cache.invalidateCharts('recruiter-activity');
    }
}
