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
    GateType,
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
            candidate_recruiter_id: assignment.candidate_recruiter_id,
            company_recruiter_id: assignment.company_recruiter_id,
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
            candidate_recruiter_id: updated.candidate_recruiter_id,
            company_recruiter_id: updated.company_recruiter_id,
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
            candidate_recruiter_id: assignment.candidate_recruiter_id,
            company_recruiter_id: assignment.company_recruiter_id,
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
        // Check if assignment exists for this job and candidate
        const { data: existingAssignments } = await this.repository.list(clerkUserId, {
            job_id: jobId,
            candidate_id: candidateId,
            limit: 10
        });

        // Filter to assignments involving this recruiter in either role
        const recruiterAssignment = existingAssignments.find(a =>
            a.candidate_recruiter_id === recruiterId ||
            a.company_recruiter_id === recruiterId
        );

        if (recruiterAssignment) {
            // Update existing assignment based on application state
            const assignmentState = this.mapApplicationStateToAssignmentState(applicationState);
            const now = new Date();

            const updates: CandidateRoleAssignmentUpdateInput = {
                state: assignmentState,
            };

            // Set timestamps based on state
            if (assignmentState === 'submitted_to_company' && !recruiterAssignment.submitted_at) {
                updates.submitted_at = now;
            } else if ((assignmentState === 'hired' || assignmentState === 'rejected') && !recruiterAssignment.closed_at) {
                updates.closed_at = now;
            }

            return this.update(recruiterAssignment.id, clerkUserId, updates);
        } else {
            // Create new assignment (auto-accepted)
            const now = new Date();
            const assignmentState = this.mapApplicationStateToAssignmentState(applicationState);

            return this.create(clerkUserId, {
                job_id: jobId,
                candidate_id: candidateId,
                candidate_recruiter_id: recruiterId,
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

        // Determine which recruiter field to use based on context
        // TODO: In Phase 2, determine if recruiter represents candidate or company
        // For now, default to candidate_recruiter_id
        const createInput: CandidateRoleAssignmentCreateInput = {
            job_id: input.job_id,
            candidate_id: input.candidate_id,
            candidate_recruiter_id: context.recruiterId || undefined,  // Default to candidate representation
            company_recruiter_id: undefined,  // Set when recruiter represents company
            state: 'proposed',
            proposed_by: context.identityUserId!,
            proposal_notes: input.proposal_notes,
            response_due_at: responseDue,
        };

        const assignment = await this.create(clerkUserId, createInput);

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
            state: 'in_process',
            accepted_at: now,
            response_notes: responseNotes,
        });

        await this.eventPublisher?.publish('candidate_role_assignment.accepted', {
            assignment_id: assignmentId,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
            candidate_recruiter_id: assignment.candidate_recruiter_id,
            company_recruiter_id: assignment.company_recruiter_id,
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
            candidate_recruiter_id: assignment.candidate_recruiter_id,
            company_recruiter_id: assignment.company_recruiter_id,
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

        if (assignment.state === 'submitted_to_company' || assignment.state === 'hired' || assignment.state === 'withdrawn') {
            return assignment; // Already in final state
        }

        return this.update(assignment.id, clerkUserId, {
            state: 'submitted_to_company',
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

        if (assignment.state === 'hired' || assignment.state === 'withdrawn' || assignment.state === 'rejected') {
            return assignment; // Already in terminal state
        }

        return this.update(assignment.id, clerkUserId, {
            state: 'hired',
            closed_at: new Date(),
        });
    }

    // Private helper methods

    private validateCreateInput(input: CandidateRoleAssignmentCreateInput): void {
        if (!input.job_id) throw new Error('job_id is required');
        if (!input.candidate_id) throw new Error('candidate_id is required');
        if (!input.proposed_by) throw new Error('proposed_by is required');

        // At least one recruiter required (candidate OR company)
        if (!input.candidate_recruiter_id && !input.company_recruiter_id) {
            throw new Error('At least one recruiter (candidate_recruiter_id or company_recruiter_id) is required');
        }
    }

    private validateStateTransition(
        currentState: CandidateRoleAssignmentState,
        newState: CandidateRoleAssignmentState
    ): void {
        const validTransitions: Record<CandidateRoleAssignmentState, CandidateRoleAssignmentState[]> = {
            proposed: ['awaiting_candidate_recruiter', 'awaiting_company_recruiter', 'awaiting_company', 'submitted_to_company', 'declined', 'timed_out'],
            awaiting_candidate_recruiter: ['awaiting_company_recruiter', 'awaiting_company', 'submitted_to_company', 'rejected'],
            awaiting_company_recruiter: ['awaiting_company', 'submitted_to_company', 'rejected'],
            awaiting_company: ['submitted_to_company', 'rejected'],
            under_review: ['info_requested', 'submitted_to_company', 'rejected'],
            info_requested: ['under_review', 'submitted_to_company', 'rejected'],
            submitted_to_company: ['screen', 'in_process', 'rejected'],
            screen: ['in_process', 'rejected'],
            in_process: ['offer', 'rejected'],
            offer: ['hired', 'declined', 'withdrawn'],
            hired: [],
            rejected: [],
            declined: [],
            withdrawn: [],
            timed_out: [],
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
                return 'proposed';
            case 'screen':
                return 'screen';
            case 'submitted':
                return 'submitted_to_company';
            case 'interview':
                return 'in_process';
            case 'offer':
                return 'offer';
            case 'hired':
                return 'hired';
            case 'rejected':
                return 'rejected';
            default:
                return 'proposed';
        }
    }

    /**
     * Approve gate (Phase 3)
     * Move to next gate in sequence or to submitted_to_company if last gate
     */
    async approveGate(
        clerkUserId: string,
        assignmentId: string,
        notes?: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.get(clerkUserId, assignmentId);
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate current gate state
        if (!assignment.current_gate) {
            throw new Error('Assignment has no current gate');
        }

        // Validate user has permission for this gate
        await this.validateGatePermission(context, assignment, assignment.current_gate);

        // Determine next gate or final state
        const gateSequence = (assignment.gate_sequence as string[]) || [];
        const currentIndex = gateSequence.indexOf(assignment.current_gate);

        if (currentIndex === -1) {
            throw new Error('Current gate not found in gate sequence');
        }

        const isLastGate = currentIndex === gateSequence.length - 1;
        const nextGate = isLastGate ? null : gateSequence[currentIndex + 1];
        const now = new Date();

        // Add approval to gate_history
        const gateHistory = (assignment.gate_history as any[]) || [];
        gateHistory.push({
            gate: assignment.current_gate,
            action: 'approved',
            timestamp: now.toISOString(),
            reviewer_user_id: context.identityUserId,
            notes: notes || 'Gate approved',
        });

        // Update assignment
        const updates: CandidateRoleAssignmentUpdateInput = {
            gate_history: gateHistory,
        };

        if (nextGate) {
            // Move to next gate
            updates.current_gate = nextGate as GateType;
            updates.state = this.mapGateToState(nextGate);
        } else {
            // All gates passed - move to submitted_to_company
            updates.current_gate = null;
            updates.state = 'submitted_to_company';
            updates.submitted_at = now;
        }

        const updated = await this.update(assignmentId, clerkUserId, updates);

        // Publish events
        await this.eventPublisher?.publish('application.gate_approved', {
            applicationId: assignment.id,
            craId: assignmentId,
            gate: assignment.current_gate,
            nextGate,
            reviewerUserId: context.identityUserId,
            notes,
            timestamp: now.toISOString(),
        });

        if (nextGate) {
            await this.eventPublisher?.publish('application.gate_entered', {
                applicationId: assignment.id,
                craId: assignmentId,
                gate: nextGate,
                previousGate: assignment.current_gate,
                gateSequence,
                remainingGates: gateSequence.slice(currentIndex + 2),
                timestamp: now.toISOString(),
            });
        } else {
            await this.eventPublisher?.publish('application.all_gates_passed', {
                applicationId: assignment.id,
                craId: assignmentId,
                timestamp: now.toISOString(),
            });
        }

        return updated;
    }

    /**
     * Deny gate (Phase 3)
     * Reject application at current gate
     */
    async denyGate(
        clerkUserId: string,
        assignmentId: string,
        reason: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.get(clerkUserId, assignmentId);
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate current gate state
        if (!assignment.current_gate) {
            throw new Error('Assignment has no current gate');
        }

        // Validate user has permission for this gate
        await this.validateGatePermission(context, assignment, assignment.current_gate);

        const now = new Date();

        // Add denial to gate_history
        const gateHistory = (assignment.gate_history as any[]) || [];
        gateHistory.push({
            gate: assignment.current_gate,
            action: 'denied',
            timestamp: now.toISOString(),
            reviewer_user_id: context.identityUserId,
            notes: reason,
        });

        // Update assignment to rejected
        const updated = await this.update(assignmentId, clerkUserId, {
            state: 'rejected',
            current_gate: null,
            gate_history: gateHistory,
        });

        // Publish event
        await this.eventPublisher?.publish('application.gate_denied', {
            applicationId: assignment.id,
            craId: assignmentId,
            gate: assignment.current_gate,
            reviewerUserId: context.identityUserId,
            reason,
            timestamp: now.toISOString(),
        });

        return updated;
    }

    /**
     * Request additional information (Phase 3)
     * Set application to info_requested state with specific questions
     */
    async requestInfo(
        clerkUserId: string,
        assignmentId: string,
        questions: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.get(clerkUserId, assignmentId);
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate current gate state
        if (!assignment.current_gate) {
            throw new Error('Assignment has no current gate');
        }

        // Validate user has permission for this gate
        await this.validateGatePermission(context, assignment, assignment.current_gate);

        const now = new Date();

        // Add info request to gate_history
        const gateHistory = (assignment.gate_history as any[]) || [];
        gateHistory.push({
            gate: assignment.current_gate,
            action: 'info_requested',
            timestamp: now.toISOString(),
            reviewer_user_id: context.identityUserId,
            notes: questions,
        });

        // Update assignment to info_requested
        const updated = await this.update(assignmentId, clerkUserId, {
            state: 'info_requested',
            gate_history: gateHistory,
        });

        // Publish event
        await this.eventPublisher?.publish('application.info_requested', {
            applicationId: assignment.id,
            craId: assignmentId,
            gate: assignment.current_gate,
            reviewerUserId: context.identityUserId,
            questions,
            timestamp: now.toISOString(),
        });

        return updated;
    }

    /**
     * Provide requested information (Phase 3)
     * Return application to under_review state with answers
     */
    async provideInfo(
        clerkUserId: string,
        assignmentId: string,
        answers: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.get(clerkUserId, assignmentId);
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Validate current state
        if (assignment.state !== 'info_requested') {
            throw new Error('Can only provide info for assignments in info_requested state');
        }

        const now = new Date();

        // Add info provision to gate_history
        const gateHistory = (assignment.gate_history as any[]) || [];
        gateHistory.push({
            gate: assignment.current_gate,
            action: 'info_provided',
            timestamp: now.toISOString(),
            responder_user_id: context.identityUserId,
            notes: answers,
        });

        // Update assignment back to under_review (stays at same gate)
        const updated = await this.update(assignmentId, clerkUserId, {
            state: 'under_review',
            gate_history: gateHistory,
        });

        // Publish event
        await this.eventPublisher?.publish('application.info_provided', {
            applicationId: assignment.id,
            craId: assignmentId,
            gate: assignment.current_gate,
            responderUserId: context.identityUserId,
            answers,
            timestamp: now.toISOString(),
        });

        return updated;
    }

    /**
     * Validate user has permission to act on current gate
     */
    private async validateGatePermission(
        context: any,
        assignment: CandidateRoleAssignment,
        gate: string
    ): Promise<void> {
        // Platform admins can act on any gate
        if (context.roles.includes('platform_admin')) {
            return;
        }

        switch (gate) {
            case 'candidate_recruiter':
                // Must be the assigned candidate recruiter
                if (context.recruiterId !== assignment.candidate_recruiter_id) {
                    throw new Error('Only the assigned candidate recruiter can act on this gate');
                }
                break;

            case 'company_recruiter':
                // Must be the assigned company recruiter
                if (context.recruiterId !== assignment.company_recruiter_id) {
                    throw new Error('Only the assigned company recruiter can act on this gate');
                }
                break;

            case 'company':
                // Must be company admin or hiring manager for the job's company
                const { data: jobData } = await this.supabase
                    .from('jobs')
                    .select('company_id')
                    .eq('id', assignment.job_id)
                    .single();

                if (!jobData) {
                    throw new Error('Job not found');
                }

                const isCompanyUser = context.accessibleCompanyIds?.includes(jobData.company_id);
                if (!isCompanyUser) {
                    throw new Error('Only company users can act on the company gate');
                }
                break;

            default:
                throw new Error(`Unknown gate: ${gate}`);
        }
    }

    /**
     * Map gate name to CRA state
     */
    private mapGateToState(gate: string): CandidateRoleAssignmentState {
        switch (gate) {
            case 'candidate_recruiter':
                return 'awaiting_candidate_recruiter';
            case 'company_recruiter':
                return 'awaiting_company_recruiter';
            case 'company':
                return 'awaiting_company';
            default:
                return 'under_review';
        }
    }

    /**
     * Determine gate routing based on recruiter assignments
     * Phase 2.2: Gate Review Infrastructure
     * 
     * 4 Routing Scenarios:
     * 1. No recruiters → Direct to company gate
     * 2. Candidate recruiter only → Candidate recruiter gate → Company gate
     * 3. Company recruiter only → Company recruiter gate → Company gate
     * 4. Both recruiters → Candidate recruiter → Company recruiter → Company gate
     */
    public async determineGateRouting(context: {
        jobId: string;
        candidateId: string;
    }): Promise<{
        firstGate: string;
        gateSequence: string[];
        hasCandidateRecruiter: boolean;
        hasCompanyRecruiter: boolean;
        candidateRecruiterId: string | null;
        companyRecruiterId: string | null;
    }> {
        // Check for active candidate recruiter relationship
        const { data: candidateRecruiterData } = await this.supabase
            .from('recruiter_candidates')
            .select('recruiter_id')
            .eq('candidate_id', context.candidateId)
            .eq('status', 'active')
            .maybeSingle();

        // Check for company recruiter assignment on job
        const { data: jobData } = await this.supabase
            .from('jobs')
            .select('recruiter_id')
            .eq('id', context.jobId)
            .single();

        const candidateRecruiterId = candidateRecruiterData?.recruiter_id || null;
        const companyRecruiterId = jobData?.recruiter_id || null;

        const hasCandidateRecruiter = !!candidateRecruiterId;
        const hasCompanyRecruiter = !!companyRecruiterId;

        // Build gate sequence based on 4 scenarios
        const gateSequence: string[] = [];

        if (hasCandidateRecruiter) {
            gateSequence.push('candidate_recruiter');
        }

        if (hasCompanyRecruiter) {
            gateSequence.push('company_recruiter');
        }

        // Company gate is always the final gate
        gateSequence.push('company');

        const firstGate = gateSequence[0];

        return {
            firstGate,
            gateSequence,
            hasCandidateRecruiter,
            hasCompanyRecruiter,
            candidateRecruiterId,
            companyRecruiterId,
        };
    }
}
