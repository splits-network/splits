/**
 * Jobs Service - V2
 * Handles ALL job updates with smart validation
 */

import { JobRepository } from './repository';
import { IEventPublisher } from '../shared/events';
import { JobFilters, JobUpdate } from './types';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

const VALID_COMMUTE_TYPES = ['remote', 'hybrid_1', 'hybrid_2', 'hybrid_3', 'hybrid_4', 'in_office'];
const VALID_JOB_LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_suite'];
const NON_DRAFT_STATUSES = ['pending', 'active', 'paused', 'filled', 'closed'];

export class JobServiceV2 {
    private accessResolver: AccessContextResolver;
    private supabase: SupabaseClient;

    constructor(
        private repository: JobRepository,
        supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher
    ) {
        this.supabase = supabase;
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
    async createJob(data: any, clerkUserId: string): Promise<any> {
        // Validation
        if (!data.title) {
            throw new Error('Job title is required');
        }
        if (!data.company_id && !data.source_firm_id) {
            throw new Error('Either company_id or source_firm_id is required');
        }

        // Off-platform job validation
        if (data.source_firm_id && !data.company_id) {
            if (!data.fee_percentage || data.fee_percentage < 5) {
                throw new Error('Off-platform jobs require a minimum 5% fee');
            }
        }

        // Validate commute_types
        if (data.commute_types) {
            if (!Array.isArray(data.commute_types)) {
                throw new Error('commute_types must be an array');
            }
            const invalid = data.commute_types.filter((t: string) => !VALID_COMMUTE_TYPES.includes(t));
            if (invalid.length > 0) {
                throw new Error(`Invalid commute_types: ${invalid.join(', ')}. Valid values: ${VALID_COMMUTE_TYPES.join(', ')}`);
            }
        }

        // Validate job_level
        if (data.job_level && !VALID_JOB_LEVELS.includes(data.job_level)) {
            throw new Error(`Invalid job_level: ${data.job_level}. Valid values: ${VALID_JOB_LEVELS.join(', ')}`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);

        const status = data.status || 'draft';

        // Early access requires an activates_at date
        if (data.is_early_access && !data.activates_at) {
            throw new Error('activates_at is required when enabling early access');
        }

        // Billing readiness gate — non-draft jobs require billing to be configured
        await this.enforceBillingReadiness(status, data.company_id, data.source_firm_id);

        const job = await this.repository.createJob({
            ...data,
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, clerkUserId);

        // Emit event (non-blocking - don't fail job creation if event publishing fails)
        if (this.eventPublisher) {
            try {
                await this.eventPublisher.publish('job.created', {
                    jobId: job.id,
                    companyId: job.company_id,
                    status: job.status,
                    createdBy: userContext.identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent job creation
                console.error('Failed to publish job.created event:', error);
            }
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
        clerkUserId: string,
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

            // Billing readiness gate — block activation if billing not configured
            await this.enforceBillingReadiness(
                updates.status,
                currentJob.company_id,
                currentJob.source_firm_id
            );

            // Early access requires an activates_at date
            if (updates.is_early_access === true) {
                const activatesAt = updates.activates_at ?? currentJob.activates_at;
                if (!activatesAt) {
                    throw new Error('activates_at is required when enabling early access');
                }
            }
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

        // Validate commute_types
        if (updates.commute_types) {
            if (!Array.isArray(updates.commute_types)) {
                throw new Error('commute_types must be an array');
            }
            const invalid = updates.commute_types.filter((t: string) => !VALID_COMMUTE_TYPES.includes(t));
            if (invalid.length > 0) {
                throw new Error(`Invalid commute_types: ${invalid.join(', ')}. Valid values: ${VALID_COMMUTE_TYPES.join(', ')}`);
            }
        }

        // Validate job_level
        if (updates.job_level && !VALID_JOB_LEVELS.includes(updates.job_level)) {
            throw new Error(`Invalid job_level: ${updates.job_level}. Valid values: ${VALID_JOB_LEVELS.join(', ')}`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        // 3. Apply updates
        const updatedJob = await this.repository.updateJob(id, clerkUserId, updates);

        // 4. Emit events based on what changed (non-blocking)
        if (this.eventPublisher) {
            try {
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
            } catch (error) {
                // Log the error but don't prevent job update
                console.error('Failed to publish job update events:', error);
            }
        }

        return updatedJob;
    }

    /**
     * Delete job (soft delete)
     */
    async deleteJob(id: string, clerkUserId: string): Promise<void> {
        const job = await this.repository.findJob(id, clerkUserId);
        if (!job) {
            throw new Error(`Job ${id} not found`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.deleteJob(id, clerkUserId);

        if (this.eventPublisher) {
            try {
                await this.eventPublisher.publish('job.deleted', {
                    jobId: id,
                    deletedBy: userContext.identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent job deletion
                console.error('Failed to publish job.deleted event:', error);
            }
        }
    }

    /**
     * Check billing readiness for a company or firm.
     * Queries billing profile tables directly (no cross-service HTTP calls).
     * Returns true if billing is ready (has profile, stripe customer, and payment method).
     */
    private async checkBillingReady(companyId?: string, firmId?: string): Promise<boolean> {
        if (companyId) {
            const { data } = await this.supabase
                .from('company_billing_profiles')
                .select('billing_email, stripe_customer_id, stripe_default_payment_method_id')
                .eq('company_id', companyId)
                .maybeSingle();

            return !!(data?.billing_email && data?.stripe_customer_id && data?.stripe_default_payment_method_id);
        }

        if (firmId) {
            const { data } = await this.supabase
                .from('firm_billing_profiles')
                .select('billing_email, stripe_customer_id, stripe_default_payment_method_id')
                .eq('firm_id', firmId)
                .maybeSingle();

            return !!(data?.billing_email && data?.stripe_customer_id && data?.stripe_default_payment_method_id);
        }

        return false;
    }

    /**
     * Enforce billing readiness for non-draft job statuses.
     * Throws a descriptive error if billing is not configured.
     */
    private async enforceBillingReadiness(status: string, companyId?: string, firmId?: string): Promise<void> {
        if (status === 'draft') return;

        const isReady = await this.checkBillingReady(companyId, firmId);
        if (!isReady) {
            const entity = companyId ? 'company' : 'firm';
            throw new Error(
                `Billing setup is required before activating a role. ` +
                `Please complete your payment setup in ${entity} settings. ` +
                `Splits Network is commission-based — you are only charged when a recruiter successfully fills your role. ` +
                `You can save this role as a draft and activate it after billing is configured.`
            );
        }
    }

    /**
     * Private helper for status transition validation
     */
    private async validateStatusTransition(
        fromStatus: string,
        toStatus: string,
        _userRole?: string
    ): Promise<void> {
        // Define allowed transitions
        const allowedTransitions: Record<string, string[]> = {
            draft:   ['pending', 'active', 'closed'],
            pending: ['draft', 'active', 'paused', 'closed'],
            active:  ['draft', 'paused', 'filled', 'closed'],
            paused:  ['draft', 'active', 'filled', 'closed'],
            filled:  ['draft', 'active', 'closed'],
            closed:  ['draft', 'active'],
        };

        if (!allowedTransitions[fromStatus]?.includes(toStatus)) {
            throw new Error(
                `Invalid status transition: ${fromStatus} -> ${toStatus}`
            );
        }
    }

    /**
     * Get jobs affected by a recruiter-company relationship termination.
     */
    async getAffectedByTermination(
        recruiterId: string,
        companyId: string
    ): Promise<any[]> {
        return this.repository.findAffectedByTermination(recruiterId, companyId);
    }

    /**
     * Process termination decisions for jobs.
     */
    async processCompanyTerminationDecisions(
        decisions: { job_id: string; action: 'keep' | 'pause' | 'close' }[],
        recruiterId: string
    ): Promise<void> {
        await this.repository.processCompanyTerminationDecisions(decisions, recruiterId);
    }
}
