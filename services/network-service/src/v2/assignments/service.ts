/**
 * Assignment Service - Business logic for role assignments
 */

import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { AssignmentRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { AssignmentFilters, AssignmentUpdate } from './types';

export class AssignmentServiceV2 {
    constructor(
        private repository: AssignmentRepository,
        private eventPublisher: IEventPublisher
    ) {}

    async getAssignments(
        clerkUserId: string,
        filters: AssignmentFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findAssignments(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getAssignment(id: string): Promise<any> {
        const assignment = await this.repository.findAssignment(id);
        if (!assignment) {
            throw { statusCode: 404, message: 'Assignment not found' };
        }
        return assignment;
    }

    async createAssignment(
        data: {
            recruiter_id: string;
            job_id: string;
            status?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation
        if (!data.recruiter_id || !data.job_id) {
            throw { statusCode: 400, message: 'recruiter_id and job_id are required' };
        }

        const assignment = await this.repository.createAssignment({
            ...data,
            status: data.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish event
        await this.eventPublisher.publish('assignment.created', {
            assignmentId: assignment.id,
            recruiterId: assignment.recruiter_id,
            jobId: assignment.job_id,
        });

        return assignment;
    }

    async updateAssignment(
        id: string,
        updates: AssignmentUpdate,
        clerkUserId: string
    ): Promise<any> {
        // Status transition validation
        if (updates.status) {
            const current = await this.repository.findAssignment(id);
            if (!current) {
                throw { statusCode: 404, message: 'Assignment not found' };
            }
            this.validateStatusTransition(current.status, updates.status);
        }

        const assignment = await this.repository.updateAssignment(id, updates);

        // Publish event
        await this.eventPublisher.publish('assignment.updated', {
            assignmentId: id,
            updates: Object.keys(updates),
        });

        return assignment;
    }

    async deleteAssignment(id: string, clerkUserId: string): Promise<void> {
        await this.repository.deleteAssignment(id);

        // Publish event
        await this.eventPublisher.publish('assignment.deleted', {
            assignmentId: id,
        });
    }

    // Private helpers

    private validateStatusTransition(currentStatus: string, newStatus: string): void {
        const validTransitions: Record<string, string[]> = {
            active: ['inactive', 'completed'],
            inactive: ['active'],
            completed: [], // Terminal state
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw {
                statusCode: 400,
                message: `Cannot transition assignment from ${currentStatus} to ${newStatus}`,
            };
        }
    }
}
