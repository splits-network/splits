/**
 * Placements Service - V2
 * Handles ALL placement updates with smart validation
 */

import { PlacementRepository } from './repository';
import { PlacementFilters, PlacementUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';

export class PlacementServiceV2 {
    constructor(
        private repository: PlacementRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async getPlacements(
        clerkUserId: string,
        filters: PlacementFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findPlacements(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse<any>(data, total, page, limit).pagination,
        };
    }

    async getPlacement(id: string): Promise<any> {
        const placement = await this.repository.findPlacement(id);
        if (!placement) {
            throw new Error(`Placement ${id} not found`);
        }
        return placement;
    }

    async createPlacement(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.job_id) {
            throw new Error('Job ID is required');
        }
        if (!data.candidate_id) {
            throw new Error('Candidate ID is required');
        }
        if (!data.application_id) {
            throw new Error('Application ID is required');
        }
        if (!data.start_date) {
            throw new Error('Start date is required');
        }
        if (!data.salary) {
            throw new Error('Salary is required');
        }
        if (!data.fee_percentage) {
            throw new Error('Fee percentage is required');
        }

        // Validate fee percentage
        if (data.fee_percentage < 0 || data.fee_percentage > 100) {
            throw new Error('Fee percentage must be between 0 and 100');
        }

        const placement = await this.repository.createPlacement({
            ...data,
            status: data.status || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('placement.created', {
                placement_id: placement.id,
                job_id: placement.job_id,
                candidate_id: placement.candidate_id,
                application_id: placement.application_id,
                recruiter_id: placement.recruiter_id,
                salary: placement.salary,
                fee_percentage: placement.fee_percentage,
                recruiter_share: placement.recruiter_share,
                created_by: clerkUserId,
            });
        }

        return placement;
    }

    async updatePlacement(
        id: string,
        updates: PlacementUpdate,
        clerkUserId?: string,
        userRole?: string
    ): Promise<any> {
        const currentPlacement = await this.repository.findPlacement(id);
        if (!currentPlacement) {
            throw new Error(`Placement ${id} not found`);
        }

        // Smart validation based on what's changing

        // Status change validation
        if (updates.status && updates.status !== currentPlacement.status) {
            await this.validateStatusTransition(
                currentPlacement.status,
                updates.status,
                userRole
            );
        }

        // Fee percentage validation
        if (updates.fee_percentage !== undefined) {
            if (updates.fee_percentage < 0 || updates.fee_percentage > 100) {
                throw new Error('Fee percentage must be between 0 and 100');
            }
        }

        // Salary validation
        if (updates.salary !== undefined && updates.salary < 0) {
            throw new Error('Salary must be positive');
        }

        const updatedPlacement = await this.repository.updatePlacement(id, updates);

        // Emit events based on what changed
        if (this.eventPublisher) {
            if (updates.status && updates.status !== currentPlacement.status) {
                await this.eventPublisher.publish('placement.status_changed', {
                    placement_id: id,
                    previous_status: currentPlacement.status,
                    new_status: updates.status,
                    changed_by: clerkUserId,
                });
            }

            await this.eventPublisher.publish('placement.updated', {
                placement_id: id,
                updated_fields: Object.keys(updates),
                updated_by: clerkUserId,
            });
        }

        return updatedPlacement;
    }

    async deletePlacement(id: string, clerkUserId?: string): Promise<void> {
        const placement = await this.repository.findPlacement(id);
        if (!placement) {
            throw new Error(`Placement ${id} not found`);
        }

        await this.repository.deletePlacement(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('placement.deleted', {
                placement_id: id,
                deleted_by: clerkUserId,
            });
        }
    }

    /**
     * Private helper for status transition validation
     */
    private async validateStatusTransition(
        fromStatus: string,
        toStatus: string,
        userRole?: string
    ): Promise<void> {
        // Define allowed status transitions
        const allowedTransitions: Record<string, string[]> = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['active', 'cancelled'],
            active: ['completed', 'cancelled'],
            completed: [], // Cannot change from completed
            cancelled: [], // Cannot change from cancelled
        };

        if (!allowedTransitions[fromStatus]?.includes(toStatus)) {
            throw new Error(
                `Invalid status transition: ${fromStatus} -> ${toStatus}`
            );
        }

        // Role-based restrictions
        if (toStatus === 'completed' && userRole === 'hiring_manager') {
            throw new Error('Only admins can mark placements as completed');
        }
    }
}
