/**
 * Applications Service - V2
 * Handles ALL application updates with smart validation
 */

import { ApplicationRepository } from './repository';
import { ApplicationFilters, ApplicationUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';

export class ApplicationServiceV2 {
    constructor(
        private repository: ApplicationRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async getApplications(
        clerkUserId: string,
        filters: ApplicationFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findApplications(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse<any>(data, total, page, limit).pagination,
        };
    }

    async getApplication(id: string, clerkUserId?: string): Promise<any> {
        const application = await this.repository.findApplication(id, clerkUserId);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }
        return application;
    }

    async createApplication(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.job_id) {
            throw new Error('Job ID is required');
        }
        if (!data.candidate_id) {
            throw new Error('Candidate ID is required');
        }

        const application = await this.repository.createApplication({
            ...data,
            status: data.status || 'active',
            stage: data.stage || 'applied',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.created', {
                applicationId: application.id,
                jobId: application.job_id,
                candidateId: application.candidate_id,
                stage: application.stage,
                createdBy: clerkUserId,
            });
        }

        return application;
    }

    async updateApplication(
        id: string,
        updates: ApplicationUpdate,
        clerkUserId?: string,
        userRole?: string
    ): Promise<any> {
        const currentApplication = await this.repository.findApplication(id, clerkUserId);
        if (!currentApplication) {
            throw new Error(`Application ${id} not found`);
        }

        // Smart validation based on what's changing

        // Stage change validation
        if (updates.stage && updates.stage !== currentApplication.stage) {
            await this.validateStageTransition(
                currentApplication.stage,
                updates.stage
            );
        }

        // If rejecting, require rejection reason
        if (updates.stage === 'rejected' && !updates.notes && !currentApplication.notes) {
            throw new Error('Notes/rejection reason required when rejecting');
        }

        const updatedApplication = await this.repository.updateApplication(id, updates);

        // Emit events based on what changed
        if (this.eventPublisher) {
            if (updates.stage && updates.stage !== currentApplication.stage) {
                await this.eventPublisher.publish('application.stage_changed', {
                    applicationId: id,
                    previousStage: currentApplication.stage,
                    newStage: updates.stage,
                    changedBy: clerkUserId,
                });
            }

            await this.eventPublisher.publish('application.updated', {
                applicationId: id,
                updatedFields: Object.keys(updates),
                updatedBy: clerkUserId,
            });
        }

        return updatedApplication;
    }

    async deleteApplication(id: string, clerkUserId?: string): Promise<void> {
        const application = await this.repository.findApplication(id, clerkUserId);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }

        await this.repository.deleteApplication(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.deleted', {
                applicationId: id,
                deletedBy: clerkUserId,
            });
        }
    }

    /**
     * Private helper for stage transition validation
     */
    private async validateStageTransition(
        fromStage: string,
        toStage: string
    ): Promise<void> {
        // Define allowed stage transitions
        const allowedTransitions: Record<string, string[]> = {
            applied: ['screening', 'rejected'],
            screening: ['interview', 'rejected', 'applied'],
            interview: ['offer', 'rejected', 'screening'],
            offer: ['hired', 'rejected', 'interview'],
            hired: ['rejected'], // Can reject after hire (fell through)
            rejected: [], // Cannot move from rejected
        };

        if (!allowedTransitions[fromStage]?.includes(toStage)) {
            throw new Error(
                `Invalid stage transition: ${fromStage} -> ${toStage}`
            );
        }
    }
}
