/**
 * V2 Repository for Candidate Role Assignments
 * 
 * Manages CRUD operations for candidate-job-recruiter assignments.
 * Handles fiscal tracking and recruiter attribution per pairing.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import type {
    CandidateRoleAssignment,
    CandidateRoleAssignmentCreateInput,
    CandidateRoleAssignmentUpdateInput,
    CandidateRoleAssignmentFilters,
    StandardListParams,
    StandardListResponse,
} from '@splits-network/shared-types';

export class CandidateRoleAssignmentRepository {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger
    ) { }

    /**
     * List assignments with role-based filtering
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & CandidateRoleAssignmentFilters
    ): Promise<StandardListResponse<CandidateRoleAssignment>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const {
            page = 1,
            limit = 25,
            search,
            sort_by = 'created_at',
            sort_order = 'desc',
            job_id,
            candidate_id,
            candidate_recruiter_id,
            company_recruiter_id,
            state,
        } = params;

        const offset = (page - 1) * limit;

        // Build base query
        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*', { count: 'exact' });

        // Apply role-based filtering
        if (context.roles.includes('recruiter')) {
            // Recruiters see assignments where they represent either the candidate or company
            query = query.or(`candidate_recruiter_id.eq.${context.recruiterId},company_recruiter_id.eq.${context.recruiterId}`);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Company users see assignments for their jobs
            // First, get companies that belong to the user's organizations
            const { data: companies } = await this.supabase
                .from('companies')
                .select('id')
                .in('identity_organization_id', context.organizationIds || []);

            const companyIds = companies?.map((c) => c.id) || [];

            if (companyIds.length > 0) {
                // Then get jobs for those companies
                const { data: companyJobs } = await this.supabase
                    .from('jobs')
                    .select('id')
                    .in('company_id', companyIds);

                const jobIds = companyJobs?.map((j) => j.id) || [];
                if (jobIds.length > 0) {
                    query = query.in('job_id', jobIds);
                } else {
                    // No jobs for these companies, return empty
                    return {
                        data: [],
                        pagination: {
                            total: 0,
                            page,
                            limit,
                            total_pages: 0,
                        },
                    };
                }
            } else {
                // No companies accessible, return empty
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        total_pages: 0,
                    },
                };
            }
        }
        // Platform admins see everything (no filter)

        // Apply additional filters
        if (job_id) {
            query = query.eq('job_id', job_id);
        }
        if (candidate_id) {
            query = query.eq('candidate_id', candidate_id);
        }
        if (candidate_recruiter_id) {
            query = query.eq('candidate_recruiter_id', candidate_recruiter_id);
        }
        if (company_recruiter_id) {
            query = query.eq('company_recruiter_id', company_recruiter_id);
        }
        if (state) {
            if (Array.isArray(state)) {
                query = query.in('state', state);
            } else {
                query = query.eq('state', state);
            }
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            this.logger.error({ error }, 'Failed to list candidate role assignments');
            throw error;
        }

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit),
            },
        };
    }

    /**
     * Get assignment by ID with access control
     */
    async get(clerkUserId: string, id: string): Promise<CandidateRoleAssignment | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('id', id);

        // Apply role-based filtering
        if (context.roles.includes('recruiter')) {
            query = query.or(`candidate_recruiter_id.eq.${context.recruiterId},company_recruiter_id.eq.${context.recruiterId}`);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Verify job belongs to accessible company
            // First get the assignment with job info
            const assignment = await this.supabase
                .from('candidate_role_assignments')
                .select('*, jobs!inner(company_id)')
                .eq('id', id)
                .single();

            if (assignment.error || !assignment.data) {
                return null;
            }

            const job = assignment.data.jobs as any;

            // Then verify the company belongs to one of the user's organizations
            const { data: company } = await this.supabase
                .from('companies')
                .select('identity_organization_id')
                .eq('id', job.company_id)
                .single();

            if (!company || !context.organizationIds?.includes(company.identity_organization_id)) {
                return null;
            }

            return assignment.data as CandidateRoleAssignment;
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            this.logger.error({ error, id }, 'Failed to get candidate role assignment');
            throw error;
        }

        return data;
    }

    /**
     * Find assignment by application ID (1-to-1 relationship)
     */
    async findByApplicationId(
        applicationId: string
    ): Promise<CandidateRoleAssignment | null> {
        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) {
            this.logger.error({ error, applicationId }, 'Failed to find assignment by application');
            throw error;
        }

        return data;
    }

    /**
     * Find assignment by job and candidate (legacy - may return multiple if reapplications exist)
     */
    async findByJobAndCandidate(
        jobId: string,
        candidateId: string
    ): Promise<CandidateRoleAssignment | null> {
        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId)
            .maybeSingle();

        if (error) {
            this.logger.error({ error, jobId, candidateId }, 'Failed to find assignment');
            throw error;
        }

        return data;
    }

    /**
     * Create new assignment
     */
    async create(
        clerkUserId: string,
        input: CandidateRoleAssignmentCreateInput
    ): Promise<CandidateRoleAssignment> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Check for existing assignment by application_id (1-to-1 relationship)
        const existingByApp = await this.findByApplicationId(input.application_id);
        if (existingByApp) {
            throw new Error('Assignment already exists for this application');
        }

        const now = new Date();
        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .insert({
                application_id: input.application_id,
                job_id: input.job_id,
                candidate_id: input.candidate_id,
                candidate_recruiter_id: input.candidate_recruiter_id,
                company_recruiter_id: input.company_recruiter_id,
                state: input.state || 'proposed',
                current_gate: input.current_gate || null,
                gate_sequence: input.gate_sequence || [],
                gate_history: input.gate_history || [],
                has_candidate_recruiter: input.has_candidate_recruiter ?? false,
                has_company_recruiter: input.has_company_recruiter ?? false,
                proposed_at: now,
                submitted_at: input.submitted_at || null,
                accepted_at: input.accepted_at || null, // Only set when candidate accepts offer (state='accepted')
                response_due_at: input.response_due_at || null,
                proposed_by: input.proposed_by || context.identityUserId,
                proposal_notes: input.proposal_notes,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (error) {
            this.logger.error({ error, input }, 'Failed to create candidate role assignment');
            throw error;
        }

        this.logger.info(
            { assignment_id: data.id, application_id: input.application_id, job_id: input.job_id, candidate_id: input.candidate_id },
            'Created candidate role assignment'
        );

        return data;
    }

    /**
     * Update assignment
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: CandidateRoleAssignmentUpdateInput
    ): Promise<CandidateRoleAssignment> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Verify access
        const existing = await this.get(clerkUserId, id);
        if (!existing) {
            throw new Error('Assignment not found or access denied');
        }

        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .update({
                ...updates,
                updated_at: new Date(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.logger.error({ error, id, updates }, 'Failed to update candidate role assignment');
            throw error;
        }

        this.logger.info(
            { assignment_id: id, state: data.state },
            'Updated candidate role assignment'
        );

        return data;
    }

    /**
     * Delete assignment (soft delete by setting state to withdrawn)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        await this.update(id, clerkUserId, {
            state: 'withdrawn',
            closed_at: new Date(),
        });
    }

    /**
     * Get assignments where recruiter represents the candidate (Closer role)
     */
    async findByCandidateRecruiterId(
        recruiterId: string,
        filters?: Partial<CandidateRoleAssignmentFilters>
    ): Promise<CandidateRoleAssignment[]> {
        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('candidate_recruiter_id', recruiterId);

        if (filters?.state) {
            if (Array.isArray(filters.state)) {
                query = query.in('state', filters.state);
            } else {
                query = query.eq('state', filters.state);
            }
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            this.logger.error({ error, recruiterId }, 'Failed to find candidate recruiter assignments');
            throw error;
        }

        return data || [];
    }

    /**
     * Get assignments where recruiter represents the company (Client/Hiring Facilitator role)
     */
    async findByCompanyRecruiterId(
        recruiterId: string,
        filters?: Partial<CandidateRoleAssignmentFilters>
    ): Promise<CandidateRoleAssignment[]> {
        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('company_recruiter_id', recruiterId);

        if (filters?.state) {
            if (Array.isArray(filters.state)) {
                query = query.in('state', filters.state);
            } else {
                query = query.eq('state', filters.state);
            }
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            this.logger.error({ error, recruiterId }, 'Failed to find company recruiter assignments');
            throw error;
        }

        return data || [];
    }

    /**
     * Get assignments where recruiter is in either role (Candidate or Company recruiter)
     * Useful for backward compatibility and general recruiter assignment queries
     */
    async findByEitherRecruiterId(
        recruiterId: string,
        filters?: Partial<CandidateRoleAssignmentFilters>
    ): Promise<CandidateRoleAssignment[]> {
        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .or(`candidate_recruiter_id.eq.${recruiterId},company_recruiter_id.eq.${recruiterId}`);

        if (filters?.state) {
            if (Array.isArray(filters.state)) {
                query = query.in('state', filters.state);
            } else {
                query = query.eq('state', filters.state);
            }
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            this.logger.error({ error, recruiterId }, 'Failed to find recruiter assignments (either role)');
            throw error;
        }

        return data || [];
    }

    /**
     * @deprecated Use findByCandidateRecruiterId() or findByCompanyRecruiterId() instead
     * Get assignments by recruiter (legacy method for backward compatibility)
     */
    async findByRecruiter(
        recruiterId: string,
        filters?: Partial<CandidateRoleAssignmentFilters>
    ): Promise<CandidateRoleAssignment[]> {
        // Delegate to findByEitherRecruiterId for backward compatibility
        return this.findByEitherRecruiterId(recruiterId, filters);
    }

    /**
     * Get active assignments for a candidate
     */
    async findActiveByCandidate(candidateId: string): Promise<CandidateRoleAssignment[]> {
        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('candidate_id', candidateId)
            .in('state', ['accepted', 'submitted'])
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error({ error, candidateId }, 'Failed to find active candidate assignments');
            throw error;
        }

        return data || [];
    }
}
