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
            recruiter_id,
            state,
        } = params;

        const offset = (page - 1) * limit;

        // Build base query
        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*', { count: 'exact' });

        // Apply role-based filtering
        if (context.roles.includes('recruiter')) {
            // Recruiters see only their own assignments
            query = query.eq('recruiter_id', context.recruiterId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Company users see assignments for their jobs
            const { data: companyJobs } = await this.supabase
                .from('jobs')
                .select('id')
                .in('company_id', context.organizationIds || []);

            const jobIds = companyJobs?.map((j) => j.id) || [];
            if (jobIds.length > 0) {
                query = query.in('job_id', jobIds);
            } else {
                // No jobs accessible, return empty
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
        if (recruiter_id) {
            query = query.eq('recruiter_id', recruiter_id);
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
            query = query.eq('recruiter_id', context.recruiterId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Verify job belongs to accessible company
            const assignment = await this.supabase
                .from('candidate_role_assignments')
                .select('*, jobs!inner(company_id)')
                .eq('id', id)
                .single();

            if (assignment.error || !assignment.data) {
                return null;
            }

            const job = assignment.data.jobs as any;
            if (!context.organizationIds?.includes(job.company_id)) {
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
     * Find assignment by job and candidate
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
     * Find assignment by job, candidate, and recruiter
     */
    async findByJobCandidateRecruiter(
        jobId: string,
        candidateId: string,
        recruiterId: string
    ): Promise<CandidateRoleAssignment | null> {
        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId)
            .eq('recruiter_id', recruiterId)
            .maybeSingle();

        if (error) {
            this.logger.error({ error, jobId, candidateId, recruiterId }, 'Failed to find assignment');
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

        // Check for existing assignment
        const existing = await this.findByJobAndCandidate(input.job_id, input.candidate_id);
        if (existing) {
            throw new Error('Assignment already exists for this candidate-job pair');
        }

        const now = new Date();
        const { data, error } = await this.supabase
            .from('candidate_role_assignments')
            .insert({
                job_id: input.job_id,
                candidate_id: input.candidate_id,
                recruiter_id: input.recruiter_id,
                state: input.state || 'accepted',
                proposed_at: now,
                accepted_at: input.state === 'proposed' ? null : now,
                response_due_at: input.response_due_at,
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
            { assignment_id: data.id, job_id: input.job_id, candidate_id: input.candidate_id },
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
     * Delete assignment (soft delete by setting state to closed)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        await this.update(id, clerkUserId, {
            state: 'closed',
            closed_at: new Date(),
        });
    }

    /**
     * Get assignments by recruiter
     */
    async findByRecruiter(
        recruiterId: string,
        filters?: Partial<CandidateRoleAssignmentFilters>
    ): Promise<CandidateRoleAssignment[]> {
        let query = this.supabase
            .from('candidate_role_assignments')
            .select('*')
            .eq('recruiter_id', recruiterId);

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
            this.logger.error({ error, recruiterId }, 'Failed to find recruiter assignments');
            throw error;
        }

        return data || [];
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
