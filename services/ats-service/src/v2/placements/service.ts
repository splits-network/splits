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
        private eventPublisher?: EventPublisher,
        private assignmentService?: CandidateRoleAssignmentServiceV2
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
     * 1. Candidate Recruiter (from CRA)
     * 2. Company Recruiter (from CRA)
     * 3. Job Owner (from Job)
     * 4. Candidate Sourcer (if active)
     * 5. Company Sourcer (if active)
     */
    private async gatherAttribution(
        candidateId: string,
        jobId: string,
        craId?: string
    ): Promise<{
        candidate_recruiter_id: string | null;
        company_recruiter_id: string | null;
        job_owner_recruiter_id: string | null;
        candidate_sourcer_recruiter_id: string | null;
        company_sourcer_recruiter_id: string | null;
    }> {
        // 1 & 2: Get CRA for candidate_recruiter_id and company_recruiter_id
        let candidateRecruiterId: string | null = null;
        let companyRecruiterId: string | null = null;

        if (craId) {
            const { data: cra } = await this.supabase
                .from('candidate_role_assignments')
                .select('candidate_recruiter_id, company_recruiter_id')
                .eq('id', craId)
                .single();

            if (cra) {
                candidateRecruiterId = cra.candidate_recruiter_id;
                companyRecruiterId = cra.company_recruiter_id;
            }
        }

        // 3: Get job for job_owner_recruiter_id and company_id
        const { data: job } = await this.supabase
            .from('jobs')
            .select('job_owner_recruiter_id, company_id')
            .eq('id', jobId)
            .single();

        if (!job) {
            throw new Error(`Job ${jobId} not found for attribution gathering`);
        }

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

        if ((candidateRecruiterId || companyRecruiterId) && this.assignmentService) {
            try {
                // Find the assignment - try both recruiter types
                const filters: any = {
                    job_id: data.job_id,
                    candidate_id: data.candidate_id,
                };

                // Try to find by candidate recruiter first, then company recruiter
                if (candidateRecruiterId) {
                    filters.candidate_recruiter_id = candidateRecruiterId;
                } else if (companyRecruiterId) {
                    filters.company_recruiter_id = companyRecruiterId;
                }

                const assignments = await this.assignmentService.list(clerkUserId || '', filters);

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

        // Gather all 5 role attributions for commission calculation
        const attribution = await this.gatherAttribution(
            data.candidate_id,
            data.job_id,
            data.candidate_role_assignment_id
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
