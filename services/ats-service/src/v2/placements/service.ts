/**
 * Placements Service - V2
 * Handles ALL placement updates with smart validation
 */

import { PlacementRepository } from './repository';
import { PlacementFilters, PlacementUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateRoleAssignmentServiceV2 } from '../candidate-role-assignments/service';

export class PlacementServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        supabase: SupabaseClient,
        private repository: PlacementRepository,
        private eventPublisher?: EventPublisher,
        private assignmentService?: CandidateRoleAssignmentServiceV2
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

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

        // If recruiter_id provided, validate and close the assignment
        if (data.recruiter_id && this.assignmentService) {
            try {
                // Find the assignment
                const assignments = await this.assignmentService.list(clerkUserId || '', {
                    job_id: data.job_id,
                    candidate_id: data.candidate_id,
                    recruiter_id: data.recruiter_id,
                });

                if (assignments.data.length === 0) {
                    throw new Error(
                        'No assignment found for this candidate-job-recruiter combination. ' +
                        'An assignment must exist before creating a placement.'
                    );
                }

                const assignment = assignments.data[0];

                // Validate assignment is in a state that can be closed
                if (assignment.state === 'closed') {
                    throw new Error('Assignment is already closed');
                }
                if (assignment.state === 'declined' || assignment.state === 'timed_out') {
                    throw new Error(
                        'Cannot create placement for declined or timed out assignment'
                    );
                }

                // Close the assignment
                if (!clerkUserId) {
                    throw new Error('User ID required to close assignment');
                }
                if (!assignment.job_id || !assignment.candidate_id) {
                    throw new Error('Assignment missing required job_id or candidate_id');
                }
                await this.assignmentService.closeAssignment(
                    clerkUserId,
                    assignment.job_id,
                    assignment.candidate_id
                );
            } catch (error) {
                console.error('Assignment validation/closure failed:', error);
                throw new Error(
                    `Failed to validate/close assignment: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
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
                created_by: userContext.identityUserId,
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

        const userContext = await this.accessResolver.resolve(clerkUserId);
        const updatedPlacement = await this.repository.updatePlacement(id, updates);

        // Emit events based on what changed
        if (this.eventPublisher) {
            if (updates.status && updates.status !== currentPlacement.status) {
                await this.eventPublisher.publish('placement.status_changed', {
                    placement_id: id,
                    previous_status: currentPlacement.status,
                    new_status: updates.status,
                    changed_by: userContext.identityUserId,
                });
            }

            await this.eventPublisher.publish('placement.updated', {
                placement_id: id,
                updated_fields: Object.keys(updates),
                updated_by: userContext.identityUserId,
            });
        }

        return updatedPlacement;
    }

    async deletePlacement(id: string, clerkUserId?: string): Promise<void> {
        const placement = await this.repository.findPlacement(id);
        if (!placement) {
            throw new Error(`Placement ${id} not found`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.deletePlacement(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('placement.deleted', {
                placement_id: id,
                deleted_by: userContext.identityUserId,
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
