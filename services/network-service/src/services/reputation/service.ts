import { NetworkRepository } from '../../repository';
import { RecruiterReputation } from '@splits-network/shared-types';

/**
 * Phase 2: Recruiter Reputation Service
 * 
 * Aggregates and calculates reputation metrics for recruiters.
 */
export class RecruiterReputationService {
    constructor(
        private repository: NetworkRepository,
        private eventPublisher?: any
    ) {}

    /**
     * Get reputation for a recruiter.
     */
    async getRecruiterReputation(recruiterId: string): Promise<RecruiterReputation> {
        const reputation = await this.repository.findRecruiterReputation(recruiterId);
        if (!reputation) {
            // Initialize if doesn't exist
            return await this.repository.createRecruiterReputation(recruiterId);
        }
        return reputation;
    }

    /**
     * Recalculate reputation metrics for a recruiter.
     * This would be called after major events (hire, placement completion, etc.)
     */
    async recalculateReputation(recruiterId: string): Promise<RecruiterReputation> {
        const current = await this.getRecruiterReputation(recruiterId);
        const oldScore = current.reputation_score;

        // Calculate rates
        const hireRate = current.total_submissions > 0 
            ? (current.total_hires / current.total_submissions) * 100 
            : null;

        const completionRate = current.total_placements > 0
            ? (current.completed_placements / current.total_placements) * 100
            : null;

        const collaborationRate = current.total_placements > 0
            ? (current.total_collaborations / current.total_placements) * 100
            : null;

        // Calculate overall score (0-100)
        // Weighted formula:
        // - Hire rate: 40%
        // - Completion rate: 30%
        // - Collaboration rate: 15%
        // - Responsiveness: 15%
        let score = 50.0; // Start at 50 (neutral)

        if (hireRate !== null) {
            score += (hireRate * 0.4) - 20; // Normalize around 50
        }

        if (completionRate !== null) {
            score += (completionRate * 0.3) - 15;
        }

        if (collaborationRate !== null) {
            score += (collaborationRate * 0.15) - 7.5;
        }

        // Responsiveness factor (fewer timeouts = better)
        const totalProposals = current.proposals_accepted + current.proposals_declined + current.proposals_timed_out;
        if (totalProposals > 0) {
            const responseRate = ((current.proposals_accepted + current.proposals_declined) / totalProposals) * 100;
            score += (responseRate * 0.15) - 7.5;
        }

        // Clamp between 0 and 100
        score = Math.max(0, Math.min(100, score));

        const updates: Partial<RecruiterReputation> = {
            hire_rate: hireRate ?? undefined,
            completion_rate: completionRate ?? undefined,
            collaboration_rate: collaborationRate ?? undefined,
            reputation_score: score,
            last_calculated_at: new Date(),
        };

        const updated = await this.repository.updateRecruiterReputation(recruiterId, updates);

        // Publish event if score changed significantly
        if (this.eventPublisher && Math.abs(score - oldScore) >= 5) {
            await this.eventPublisher.publish(
                'reputation.updated',
                {
                    recruiter_id: recruiterId,
                    old_score: oldScore,
                    new_score: score,
                    reason: 'recalculation',
                },
                'network-service'
            );
        }

        return updated;
    }

    /**
     * Increment submission count.
     */
    async incrementSubmissions(recruiterId: string): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        await this.repository.updateRecruiterReputation(recruiterId, {
            total_submissions: reputation.total_submissions + 1,
        });
    }

    /**
     * Increment hire count.
     */
    async incrementHires(recruiterId: string): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        await this.repository.updateRecruiterReputation(recruiterId, {
            total_hires: reputation.total_hires + 1,
        });
        // Recalculate after hire
        await this.recalculateReputation(recruiterId);
    }

    /**
     * Record a placement outcome.
     */
    async recordPlacementOutcome(
        recruiterId: string,
        completed: boolean,
        wasCollaboration: boolean
    ): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        
        const updates: any = {
            total_placements: reputation.total_placements + 1,
        };

        if (completed) {
            updates.completed_placements = reputation.completed_placements + 1;
        } else {
            updates.failed_placements = reputation.failed_placements + 1;
        }

        if (wasCollaboration) {
            updates.total_collaborations = reputation.total_collaborations + 1;
        }

        await this.repository.updateRecruiterReputation(recruiterId, updates);
        await this.recalculateReputation(recruiterId);
    }

    /**
     * Record a proposal response.
     */
    async recordProposalResponse(
        recruiterId: string,
        response: 'accepted' | 'declined' | 'timed_out'
    ): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        
        const updates: any = {};
        
        if (response === 'accepted') {
            updates.proposals_accepted = reputation.proposals_accepted + 1;
        } else if (response === 'declined') {
            updates.proposals_declined = reputation.proposals_declined + 1;
        } else if (response === 'timed_out') {
            updates.proposals_timed_out = reputation.proposals_timed_out + 1;
        }

        await this.repository.updateRecruiterReputation(recruiterId, updates);
        await this.recalculateReputation(recruiterId);
    }

    /**
     * Get top recruiters by reputation score.
     */
    async getTopRecruiters(limit: number = 10): Promise<RecruiterReputation[]> {
        return await this.repository.findTopRecruitersByReputation(limit);
    }
}
