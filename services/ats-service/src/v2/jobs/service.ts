/**
 * Jobs Service - V2
 * Handles ALL job updates with smart validation
 */

import { JobRepository } from './repository';
import { EventPublisher } from '../shared/events';
import { JobFilters, JobUpdate } from './types';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

export class JobServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: JobRepository,
        supabase: SupabaseClient,
        private eventPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * Get jobs with role-based scoping and pagination
     */
    async getJobs(
        clerkUserId: string | undefined,
        filters: JobFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findJobs(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        const paginationResponse = buildPaginationResponse<any>(data, total, page, limit);

        return {
            data,
            pagination: paginationResponse.pagination,
        };
    }

    /**
     * Get single job by ID
     */
    async getJob(id: string, clerkUserId?: string, include: string[] = []): Promise<any> {
        const job = await this.repository.findJob(id, clerkUserId, include);
        if (!job) {
            throw new Error(`Job ${id} not found`);
        }
        return job;
    }

    /**
     * Create new job
     */
    async createJob(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.title) {
            throw new Error('Job title is required');
        }
        if (!data.company_id) {
            throw new Error('Company ID is required');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);

        const job = await this.repository.createJob({
            ...data,
            job_owner_id: userContext.identityUserId,
            status: data.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('job.created', {
                jobId: job.id,
                companyId: job.company_id,
                status: job.status,
                createdBy: userContext.identityUserId,
            });
        }

        return job;
    }

    /**
     * Update job - handles ALL updates with smart validation
     * This single method replaces multiple specific update methods
     */
    async updateJob(
        id: string,
        updates: JobUpdate,
        clerkUserId?: string,
        userRole?: string
    ): Promise<any> {
        // 1. Get current job state
        const currentJob = await this.repository.findJob(id, clerkUserId);
        if (!currentJob) {
            throw new Error(`Job ${id} not found`);
        }

        // 2. Smart validation based on what's changing

        // Status change validation
        if (updates.status && updates.status !== currentJob.status) {
            await this.validateStatusTransition(
                currentJob.status,
                updates.status,
                userRole
            );
        }

        // // If closing job, require reason
        // if (updates.status === 'closed' && !updates.closed_reason) {
        //     throw new Error('closed_reason is required when closing a job');
        // }

        // // If reopening, clear closed fields
        // if (updates.status === 'active' && currentJob.status === 'closed') {
        //     updates.closed_reason = undefined;
        // }

        // Salary validation
        if (updates.salary_min !== undefined && updates.salary_max !== undefined) {
            if (updates.salary_min > updates.salary_max) {
                throw new Error('salary_min cannot exceed salary_max');
            }
        } else if (updates.salary_min !== undefined && currentJob.salary_max) {
            if (updates.salary_min > currentJob.salary_max) {
                throw new Error('salary_min cannot exceed salary_max');
            }
        } else if (updates.salary_max !== undefined && currentJob.salary_min) {
            if (currentJob.salary_min > updates.salary_max) {
                throw new Error('salary_min cannot exceed salary_max');
            }
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        // 3. Apply updates
        const updatedJob = await this.repository.updateJob(id, updates);

        // 4. Emit events based on what changed
        if (this.eventPublisher) {
            if (updates.status && updates.status !== currentJob.status) {
                await this.eventPublisher.publish('job.status_changed', {
                    jobId: id,
                    previousStatus: currentJob.status,
                    newStatus: updates.status,
                    changedBy: userContext.identityUserId,
                });
            }

            // Generic update event
            await this.eventPublisher.publish('job.updated', {
                jobId: id,
                updatedFields: Object.keys(updates),
                updatedBy: userContext.identityUserId,
            });
        }

        return updatedJob;
    }

    /**
     * Delete job (soft delete)
     */
    async deleteJob(id: string, clerkUserId?: string): Promise<void> {
        const job = await this.repository.findJob(id, clerkUserId);
        if (!job) {
            throw new Error(`Job ${id} not found`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.deleteJob(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('job.deleted', {
                jobId: id,
                deletedBy: userContext.identityUserId,
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
        // Define allowed transitions
        const allowedTransitions: Record<string, string[]> = {
            draft: ['active', 'closed'],
            active: ['paused', 'closed', 'filled'],
            paused: ['active', 'closed', 'filled'],
            closed: ['active', 'filled'], // Can reopen
            filled: ['active', 'closed'],
        };

        if (!allowedTransitions[fromStatus]?.includes(toStatus)) {
            throw new Error(
                `Invalid status transition: ${fromStatus} -> ${toStatus}`
            );
        }

        // Role-based restrictions (example - customize as needed)
        if (toStatus === 'closed' && userRole === 'hiring_manager') {
            throw new Error('Only admins can close jobs');
        }
    }
}
