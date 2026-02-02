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
import { CompanySourcerRepository } from '../company-sourcers/repository';
import { CandidateSourcerRepository } from '../candidate-sourcers/repository';

export class PlacementServiceV2 {
    private accessResolver: AccessContextResolver;
    private supabase: SupabaseClient;

    constructor(
        supabase: SupabaseClient,
        private repository: PlacementRepository,
        private companySourcerRepo: CompanySourcerRepository,
        private candidateSourcerRepo: CandidateSourcerRepository,
        private eventPublisher?: EventPublisher
    ) {
        this.supabase = supabase;
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

    /**
     * Gather all 5 attribution role IDs for commission calculation:
     * 1. Candidate Recruiter (from application)
     * 2. Company Recruiter (from job)
     * 3. Job Owner (from job)
     * 4. Candidate Sourcer (if active)
     * 5. Company Sourcer (if active)
     */
    private async gatherAttribution(
        candidateId: string,
        jobId: string,
        applicationId: string
    ): Promise<{
        candidate_recruiter_id: string | null;
        company_recruiter_id: string | null;
        job_owner_recruiter_id: string | null;
        candidate_sourcer_recruiter_id: string | null;
        company_sourcer_recruiter_id: string | null;
    }> {
        // 1: Get candidate_recruiter_id from application
        const { data: application } = await this.supabase
            .from('applications')
            .select('candidate_recruiter_id')
            .eq('id', applicationId)
            .single();

        if (!application) {
            throw new Error(`Application ${applicationId} not found for attribution gathering`);
        }

        const candidateRecruiterId = application.candidate_recruiter_id || null;

        // 2 & 3: Get job for company_recruiter_id, job_owner_recruiter_id and company_id
        const { data: job } = await this.supabase
            .from('jobs')
            .select('company_recruiter_id, job_owner_recruiter_id, company_id')
            .eq('id', jobId)
            .single();

        if (!job) {
            throw new Error(`Job ${jobId} not found for attribution gathering`);
        }

        const companyRecruiterId = job.company_recruiter_id || null;
        const jobOwnerRecruiterId = job.job_owner_recruiter_id || null;

        // 4: Get candidate sourcer (check if active)
        const candidateSourcer = await this.candidateSourcerRepo.getByCandidateId(candidateId);
        const candidateSourcerActive = candidateSourcer
            ? await this.candidateSourcerRepo.isSourcerActive(candidateId)
            : false;

        // 5: Get company sourcer (check if active)
        const companySourcer = await this.companySourcerRepo.getByCompanyId(job.company_id);
        const companySourcerActive = companySourcer
            ? await this.companySourcerRepo.isSourcerActive(job.company_id)
            : false;

        return {
            candidate_recruiter_id: candidateRecruiterId,
            company_recruiter_id: companyRecruiterId,
            job_owner_recruiter_id: jobOwnerRecruiterId,
            candidate_sourcer_recruiter_id:
                candidateSourcerActive && candidateSourcer
                    ? candidateSourcer.sourcer_recruiter_id
                    : null,
            company_sourcer_recruiter_id:
                companySourcerActive && companySourcer ? companySourcer.sourcer_recruiter_id : null,
        };
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

        // If candidate_recruiter_id or company_recruiter_id provided, validate and close the assignment
        const candidateRecruiterId = data.candidate_recruiter_id;
        const companyRecruiterId = data.company_recruiter_id;

        // Note: Assignment validation removed - using referential data approach
        // Placement creation now uses direct recruiter relationships from application data

        const userContext = await this.accessResolver.resolve(clerkUserId);
        const guaranteeDays = data.guarantee_days ?? 90;
        const guaranteeExpiresAt = this.computeGuaranteeExpiresAt(data.start_date, guaranteeDays);

        const placement = await this.repository.createPlacement({
            ...data,
            guarantee_days: guaranteeDays,
            guarantee_expires_at: guaranteeExpiresAt,
            status: data.status || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Gather all 5 role attributions for commission calculation
        const attribution = await this.gatherAttribution(
            data.candidate_id,
            data.job_id,
            data.application_id
        );

        // Emit event with all attribution data
        if (this.eventPublisher) {
            await this.eventPublisher.publish('placement.created', {
                placement_id: placement.id,
                job_id: placement.job_id,
                candidate_id: placement.candidate_id,
                application_id: placement.application_id,
                recruiter_id: placement.recruiter_id, // Legacy field
                salary: placement.salary,
                fee_percentage: placement.fee_percentage,
                recruiter_share: placement.recruiter_share,
                created_by: userContext.identityUserId,
                // Add all 5 role IDs for commission calculation
                ...attribution,
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
        const nextGuaranteeDays = updates.guarantee_days ?? currentPlacement.guarantee_days ?? 90;
        const nextStartDate = updates.start_date ?? currentPlacement.start_date;
        const guaranteeExpiresAt = (updates.start_date || updates.guarantee_days)
            ? this.computeGuaranteeExpiresAt(nextStartDate, nextGuaranteeDays)
            : undefined;

        const updatedPlacement = await this.repository.updatePlacement(id, {
            ...updates,
            ...(guaranteeExpiresAt ? { guarantee_expires_at: guaranteeExpiresAt } : {}),
        });

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

    /**
     * Phase 4: Create placement from application using referential data approach
     * Gathers all 5 role IDs from referential sources instead of duplicating on placement
     */
    async createPlacementFromApplication(applicationId: string): Promise<any> {
        // Get application with related data
        const { data: application } = await this.supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (!application) {
            throw new Error(`Application ${applicationId} not found`);
        }

        if (application.stage !== 'hired') {
            throw new Error(`Application must be in 'hired' stage to create placement. Current stage: ${application.stage}`);
        }

        // Get job data with company_id and job owner
        const { data: job } = await this.supabase
            .from('jobs')
            .select('id, company_id, company_recruiter_id, job_owner_recruiter_id, fee_percentage')
            .eq('id', application.job_id)
            .single();

        if (!job) {
            throw new Error(`Job ${application.job_id} not found`);
        }

        // Get all 5 recruiter role IDs from referential data (all nullable)
        const candidateRecruiterId = application.candidate_recruiter_id;  // From application
        const companyRecruiterId = job.company_recruiter_id;              // From job  
        const jobOwnerRecruiterId = job.job_owner_recruiter_id;           // From job

        // Get sourcer IDs from dedicated tables (all nullable)
        const candidateSourcer = await this.candidateSourcerRepo.getByCandidateId(application.candidate_id);
        const companySourcer = await this.companySourcerRepo.getByCompanyId(job.company_id);

        // Only include active sourcers for commission
        const candidateSourcerActive = candidateSourcer ?
            await this.candidateSourcerRepo.isSourcerActive(application.candidate_id) : false;
        const companySourcerActive = companySourcer ?
            await this.companySourcerRepo.isSourcerActive(job.company_id) : false;

        const candidateSourcerRecruiterId = candidateSourcerActive ?
            candidateSourcer?.sourcer_recruiter_id : null;
        const companySourcerRecruiterId = companySourcerActive ?
            companySourcer?.sourcer_recruiter_id : null;

        // Calculate placement fee
        const salary = application.salary || 0;
        const feePercentage = job.fee_percentage || 0;
        const placementFee = Math.round((salary * feePercentage) / 100);

        // Create placement with snapshot of all role IDs
        const startDate = new Date();
        const guaranteeDays = 90;
        const guaranteeExpiresAt = this.computeGuaranteeExpiresAt(startDate, guaranteeDays);

        const placement = await this.repository.createPlacement({
            application_id: application.id,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            company_id: job.company_id, // Add missing company_id from job

            // Snapshot all 5 role IDs from referential data (all nullable)
            candidate_recruiter_id: candidateRecruiterId,
            company_recruiter_id: companyRecruiterId,
            job_owner_recruiter_id: jobOwnerRecruiterId,
            candidate_sourcer_recruiter_id: candidateSourcerRecruiterId,
            company_sourcer_recruiter_id: companySourcerRecruiterId,

            // Money details
            salary: salary,
            fee_percentage: feePercentage,
            placement_fee: placementFee,

            state: 'active',
            start_date: startDate, // Default to current date, can be updated later
            guarantee_days: guaranteeDays,
            guarantee_expires_at: guaranteeExpiresAt,
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Update application with placement link and hired timestamp
        await this.supabase
            .from('applications')
            .update({
                placement_id: placement.id,
                hired_at: new Date(),
                updated_at: new Date(),
            })
            .eq('id', applicationId);

        // Publish placement created event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('placement.created', {
                placement_id: placement.id,
                application_id: application.id,
                candidate_id: application.candidate_id,
                job_id: application.job_id,
                candidate_recruiter_id: candidateRecruiterId,
                company_recruiter_id: companyRecruiterId,
                job_owner_recruiter_id: jobOwnerRecruiterId,
                candidate_sourcer_recruiter_id: candidateSourcerRecruiterId,
                company_sourcer_recruiter_id: companySourcerRecruiterId,
                // Include all fee-related fields for consumer flexibility
                salary: salary,
                fee_percentage: feePercentage,
                placement_fee: placementFee,
                created_by: 'system', // Created automatically when application hired
            });
        }

        return placement;
    }

    private computeGuaranteeExpiresAt(startDate: string | Date | null | undefined, guaranteeDays: number): string | null {
        if (!startDate || !guaranteeDays) return null;
        const baseDate = new Date(startDate);
        if (Number.isNaN(baseDate.getTime())) return null;
        const expiresAt = new Date(baseDate.getTime() + guaranteeDays * 86400000);
        return expiresAt.toISOString();
    }
}
