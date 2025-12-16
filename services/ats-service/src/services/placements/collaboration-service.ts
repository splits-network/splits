import { AtsRepository } from '../../repository';
import { EventPublisher } from '../../events';
import {
    PlacementCollaborator,
    CollaboratorRole,
} from '@splits-network/shared-types';

/**
 * Phase 2: Multi-Recruiter Placement Collaboration Service
 * 
 * Manages multiple recruiters working together on placements with explicit splits.
 */
export class PlacementCollaborationService {
    constructor(
        private repository: AtsRepository,
        private eventPublisher: EventPublisher
    ) {}

    /**
     * Add a collaborator to a placement with a specific role and split.
     */
    async addCollaborator(
        placementId: string,
        recruiterUserId: string,
        role: CollaboratorRole,
        splitPercentage: number,
        splitAmount: number,
        notes?: string
    ): Promise<PlacementCollaborator> {
        // Verify placement exists
        const placement = await this.repository.findPlacementById(placementId);
        if (!placement) {
            throw new Error(`Placement ${placementId} not found`);
        }

        // Verify split math (total shouldn't exceed 100%)
        const existingCollaborators = await this.repository.findPlacementCollaborators(placementId);
        const totalExistingSplit = existingCollaborators.reduce(
            (sum, c) => sum + Number(c.split_percentage), 
            0
        );
        
        if (totalExistingSplit + splitPercentage > 100) {
            throw new Error(`Total split percentage would exceed 100% (current: ${totalExistingSplit}%, adding: ${splitPercentage}%)`);
        }

        const collaborator = await this.repository.createPlacementCollaborator({
            placement_id: placementId,
            recruiter_user_id: recruiterUserId,
            role,
            split_percentage: splitPercentage,
            split_amount: splitAmount,
            notes,
        });

        // Publish event
        await this.eventPublisher.publish(
            'collaboration.accepted',
            {
                placement_id: placementId,
                recruiter_user_id: recruiterUserId,
                role,
                split_percentage: splitPercentage,
            },
            'ats-service'
        );

        return collaborator;
    }

    /**
     * Get all collaborators for a placement
     */
    async getPlacementCollaborators(placementId: string): Promise<PlacementCollaborator[]> {
        return await this.repository.findPlacementCollaborators(placementId);
    }

    /**
     * Calculate split math for a multi-recruiter placement.
     * Sourcer gets first priority, then submitter, then closer, then support roles.
     */
    calculateCollaboratorSplits(
        totalRecruiterShare: number,
        roles: Array<{ role: CollaboratorRole; weight?: number }>
    ): Array<{ role: CollaboratorRole; splitPercentage: number; splitAmount: number }> {
        // Default weights by role
        const defaultWeights: Record<CollaboratorRole, number> = {
            sourcer: 40,
            submitter: 30,
            closer: 20,
            support: 10,
        };

        // Calculate total weight
        const totalWeight = roles.reduce((sum, r) => {
            return sum + (r.weight ?? defaultWeights[r.role]);
        }, 0);

        // Distribute shares proportionally
        return roles.map((r) => {
            const weight = r.weight ?? defaultWeights[r.role];
            const splitPercentage = (weight / totalWeight) * 100;
            const splitAmount = (totalRecruiterShare * weight) / totalWeight;

            return {
                role: r.role,
                splitPercentage: Number(splitPercentage.toFixed(2)),
                splitAmount: Number(splitAmount.toFixed(2)),
            };
        });
    }

    /**
     * Get placements a recruiter has collaborated on
     */
    async getRecruiterCollaborations(recruiterUserId: string): Promise<PlacementCollaborator[]> {
        return await this.repository.findCollaborationsByRecruiter(recruiterUserId);
    }
}
