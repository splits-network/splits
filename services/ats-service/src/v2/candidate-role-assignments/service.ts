/**
 * V2 Service for Candidate Role Assignments
 * 
 * Business logic for assignment lifecycle management:
 * - Creation and validation
 * - State transitions
 * - Proposal workflow (Phase 2 feature)
 * - Event publishing
 */

import { Logger } from '@splits-network/shared-logging';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import type {
    CandidateRoleAssignment,
    CandidateRoleAssignmentCreateInput,
    CandidateRoleAssignmentUpdateInput,
    CandidateRoleAssignmentFilters,
    CandidateRoleAssignmentState,
    ProposeAssignmentInput,
    StandardListParams,
    StandardListResponse,
} from '@splits-network/shared-types';
import { CandidateRoleAssignmentRepository } from './repository';
import { EventPublisher } from '../shared/events';

export class CandidateRoleAssignmentServiceV2 {
    constructor(
        private repository: CandidateRoleAssignmentRepository,
        private eventPublisher: EventPublisher | null,
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
        return this.repository.list(clerkUserId, params);
    }

    /**
     * Get assignment by ID
     */
    async get(clerkUserId: string, id: string): Promise<CandidateRoleAssignment> {
        const assignment = await this.repository.get(clerkUserId, id);
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        return assignment;
    }

    /**
     * Create assignment (auto-accepted for direct applications)
     */
    async create(
        clerkUserId: string,
        input: CandidateRoleAssignmentCreateInput
    ): Promise<CandidateRoleAssignment> {
        // Validate inputs
        this.validateCreateInput(input);

        // Create assignment
        const assignment = await this.repository.create(clerkUserId, input);

        // Publish event
        await this.eventPublisher?.publish('candidate_role_assignment.created', {
            assignment_id: assignment.id,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
            recruiter_id: assignment.recruiter_id,
            state: assignment.state,
        });

        return assignment;
    }

    /**
     * Update assignment state
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: CandidateRoleAssignmentUpdateInput
    ): Promise<CandidateRoleAssignment> {
        // Get existing assignment
        const existing = await this.get(clerkUserId, id);

        // Validate state transition
        if (updates.state && existing.state) {
            this.validateStateTransition(
                existing.state as CandidateRoleAssignmentState,
                updates.state
            );
        }

        // Update assignment
        const updated = await this.repository.update(id, clerkUserId, updates);

        // Publish event
        await this.eventPublisher?.publish('candidate_role_assignment.updated', {
            assignment_id: id,
            job_id: updated.job_id,
            candidate_id: updated.candidate_id,
            recruiter_id: updated.recruiter_id,
            old_state: existing.state,
            new_state: updated.state,
        });

        return updated;
    }

    /**
     * Delete assignment (soft delete)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const assignment = await this.get(clerkUserId, id);

        await this.repository.delete(id, clerkUserId);

        await this.eventPublisher?.publish('candidate_role_assignment.closed', {
            assignment_id: id,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
            recruiter_id: assignment.recruiter_id,
        });
    }

    /**
     * Create or update assignment for application
     * Called when application is created/updated
     */
    async createOrUpdateForApplication(
        clerkUserId: string,
        jobId: string,
        candidateId: string,
        recruiterId: string,
        applicationState: 'draft' | 'screen' | 'submitted' | 'interview' | 'offer' | 'hired' | 'rejected'
    ): Promise<CandidateRoleAssignment> {
        // Check if assignment exists
        const existing = await this.repository.findByJobCandidateRecruiter(
            jobId,
            candidateId,
            recruiterId
        );

        if (existing) {
            // Update existing assignment based on application state
            const assignmentState = this.mapApplicationStateToAssignmentState(applicationState);
            const now = new Date();

            const updates: CandidateRoleAssignmentUpdateInput = {
                state: assignmentState,
            };

            // Set timestamps based on state
            if (assignmentState === 'submitted' && !existing.submitted_at) {
                updates.submitted_at = now;
            } else if (assignmentState === 'closed' && !existing.closed_at) {
                updates.closed_at = now;
            }

            return this.update(existing.id, clerkUserId, updates);
        } else {
            // Create new assignment (auto-accepted)
            const now = new Date();
            const assignmentState = this.mapApplicationStateToAssignmentState(applicationState);

            return this.create(clerkUserId, {
                job_id: jobId,
                candidate_id: candidateId,
                recruiter_id: recruiterId,
                state: assignmentState,
                proposed_by: clerkUserId,
            });
        }
    }

    /**
     * Propose candidate for job (Phase 2 feature)
     * Creates assignment in 'proposed' state with 72-hour response window
     */
    async proposeAssignment(
        clerkUserId: string,
        input: ProposeAssignmentInput
    ): Promise<CandidateRoleAssignment> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        if (!context.roles.includes('recruiter')) {
            throw new Error('Only recruiters can propose assignments');
        }

        // Check for existing assignment
        const existing = await this.repository.findByJobAndCandidate(
            input.job_id,
            input.candidate_id
        );

        if (existing) {
            throw new Error('Assignment already exists for this candidate-job pair');
        }

        // Create proposal with 72-hour response window
        const responseDue = new Date(Date.now() + 72 * 60 * 60 * 1000);

        const assignment = await this.create(clerkUserId, {
            job_id: input.job_id,
            candidate_id: input.candidate_id,
            recruiter_id: context.recruiterId!,
            state: 'proposed',
            proposed_by: context.identityUserId || undefined,
            proposal_notes: input.proposal_notes,
            response_due_at: responseDue,
        });

        // Publish proposal event for notifications
        await this.eventPublisher?.publish('candidate_role_assignment.proposed', {
            assignment_id: assignment.id,
            job_id: input.job_id,
            candidate_id: input.candidate_id,
            recruiter_id: context.recruiterId,
            response_due_at: responseDue,
        });

        return assignment;
    }

    /**
     * Accept proposal (Phase 2 feature)
     */
    async acceptProposal(
        clerkUserId: string,
        assignmentId: string,
        responseNotes?: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.get(clerkUserId, assignmentId);

        if (assignment.state !== 'proposed') {
            throw new Error('Only proposed assignments can be accepted');
        }

        const now = new Date();
        const updated = await this.update(assignmentId, clerkUserId, {
            state: 'accepted',
            accepted_at: now,
            response_notes: responseNotes,
        });

        await this.eventPublisher?.publish('candidate_role_assignment.accepted', {
            assignment_id: assignmentId,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
            recruiter_id: assignment.recruiter_id,
        });

        return updated;
    }

    /**
     * Decline proposal (Phase 2 feature)
     */
    async declineProposal(
        clerkUserId: string,
        assignmentId: string,
        responseNotes?: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.get(clerkUserId, assignmentId);

        if (assignment.state !== 'proposed') {
            throw new Error('Only proposed assignments can be declined');
        }

        const now = new Date();
        const updated = await this.update(assignmentId, clerkUserId, {
            state: 'declined',
            declined_at: now,
            response_notes: responseNotes,
        });

        await this.eventPublisher?.publish('candidate_role_assignment.declined', {
            assignment_id: assignmentId,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
            recruiter_id: assignment.recruiter_id,
        });

        return updated;
    }

    /**
     * Mark assignment as submitted (when application is submitted)
     */
    async markAsSubmitted(
        clerkUserId: string,
        jobId: string,
        candidateId: string
    ): Promise<CandidateRoleAssignment | null> {
        const assignment = await this.repository.findByJobAndCandidate(jobId, candidateId);

        if (!assignment) {
            this.logger.warn({ jobId, candidateId }, 'No assignment found for application submission');
            return null;
        }

        if (assignment.state === 'submitted' || assignment.state === 'closed') {
            return assignment; // Already in final state
        }

        return this.update(assignment.id, clerkUserId, {
            state: 'submitted',
            submitted_at: new Date(),
        });
    }

    /**
     * Close assignment (when placement is made or job is closed)
     */
    async closeAssignment(
        clerkUserId: string,
        jobId: string,
        candidateId: string
    ): Promise<CandidateRoleAssignment | null> {
        const assignment = await this.repository.findByJobAndCandidate(jobId, candidateId);

        if (!assignment) {
            this.logger.warn({ jobId, candidateId }, 'No assignment found for closure');
            return null;
        }

        if (assignment.state === 'closed') {
            return assignment; // Already closed
        }

        return this.update(assignment.id, clerkUserId, {
            state: 'closed',
            closed_at: new Date(),
        });
    }

    // Private helper methods

    private validateCreateInput(input: CandidateRoleAssignmentCreateInput): void {
        if (!input.job_id) throw new Error('job_id is required');
        if (!input.candidate_id) throw new Error('candidate_id is required');
        if (!input.recruiter_id) throw new Error('recruiter_id is required');
    }

    private validateStateTransition(
        currentState: CandidateRoleAssignmentState,
        newState: CandidateRoleAssignmentState
    ): void {
        const validTransitions: Record<CandidateRoleAssignmentState, CandidateRoleAssignmentState[]> = {
            proposed: ['accepted', 'declined', 'timed_out'],
            accepted: ['submitted', 'closed'],
            declined: [],
            timed_out: [],
            submitted: ['closed'],
            closed: [],
        };

        const allowed = validTransitions[currentState] || [];
        if (!allowed.includes(newState)) {
            throw new Error(`Invalid state transition: ${currentState} → ${newState}`);
        }
    }

    private mapApplicationStateToAssignmentState(
        applicationState: string
    ): CandidateRoleAssignmentState {
        switch (applicationState) {
            case 'draft':
            case 'screen':
                return 'accepted';
            case 'submitted':
            case 'interview':
            case 'offer':
                return 'submitted';
            case 'hired':
            case 'rejected':
                return 'closed';
            default:
                return 'accepted';
        }
    }
}
