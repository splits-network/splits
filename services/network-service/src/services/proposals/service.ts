import { NetworkRepository } from '../../repository';
import {
    CandidateRoleAssignment,
    CandidateRoleAssignmentState,
} from '@splits-network/shared-types';

/**
 * Phase 2: Candidate-Role Assignment State Machine Service
 * 
 * Manages the proposal workflow for recruiters working on candidate-job pairings.
 * States: proposed → accepted/declined/timed_out → submitted → closed
 */
export class CandidateRoleAssignmentService {
    constructor(
        private repository: NetworkRepository,
        private eventPublisher?: any // EventPublisher for RabbitMQ
    ) {}

    /**
     * Create a new proposal for a recruiter to work on a candidate-job pairing.
     */
    async createProposal(
        jobId: string,
        candidateId: string,
        recruiterId: string,
        proposedBy?: string,
        proposalNotes?: string,
        responseDueDays: number = 3
    ): Promise<CandidateRoleAssignment> {
        // Check if proposal already exists
        const existing = await this.repository.findCandidateRoleAssignment(jobId, candidateId);
        if (existing) {
            throw new Error(`Proposal already exists for candidate ${candidateId} on job ${jobId}`);
        }

        const proposedAt = new Date();
        const responseDueAt = new Date(proposedAt);
        responseDueAt.setDate(responseDueAt.getDate() + responseDueDays);

        const assignment = await this.repository.createCandidateRoleAssignment({
            job_id: jobId,
            candidate_id: candidateId,
            recruiter_id: recruiterId,
            state: 'proposed',
            proposed_at: proposedAt,
            response_due_at: responseDueAt,
            proposed_by: proposedBy,
            proposal_notes: proposalNotes,
        });

        // Publish event
        if (this.eventPublisher) {
            await this.eventPublisher.publish(
                'proposal.created',
                {
                    assignment_id: assignment.id,
                    job_id: jobId,
                    candidate_id: candidateId,
                    recruiter_id: recruiterId,
                    response_due_at: responseDueAt.toISOString(),
                },
                'network-service'
            );
        }

        return assignment;
    }

    /**
     * Accept a proposal (company accepts recruiter working on this candidate).
     */
    async acceptProposal(
        assignmentId: string,
        responseNotes?: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.repository.getCandidateRoleAssignmentById(assignmentId);
        if (!assignment) {
            throw new Error(`Assignment ${assignmentId} not found`);
        }

        if (assignment.state !== 'proposed') {
            throw new Error(`Cannot accept proposal in state ${assignment.state}`);
        }

        const updated = await this.repository.updateCandidateRoleAssignment(assignmentId, {
            state: 'accepted',
            accepted_at: new Date(),
            response_notes: responseNotes,
        });

        // Publish event
        if (this.eventPublisher) {
            await this.eventPublisher.publish(
                'proposal.accepted',
                {
                    assignment_id: assignmentId,
                    job_id: assignment.job_id,
                    candidate_id: assignment.candidate_id,
                    recruiter_id: assignment.recruiter_id,
                },
                'network-service'
            );
        }

        return updated;
    }

    /**
     * Decline a proposal.
     */
    async declineProposal(
        assignmentId: string,
        reason?: string
    ): Promise<CandidateRoleAssignment> {
        const assignment = await this.repository.getCandidateRoleAssignmentById(assignmentId);
        if (!assignment) {
            throw new Error(`Assignment ${assignmentId} not found`);
        }

        if (assignment.state !== 'proposed') {
            throw new Error(`Cannot decline proposal in state ${assignment.state}`);
        }

        const updated = await this.repository.updateCandidateRoleAssignment(assignmentId, {
            state: 'declined',
            declined_at: new Date(),
            response_notes: reason,
        });

        // Publish event
        if (this.eventPublisher) {
            await this.eventPublisher.publish(
                'proposal.declined',
                {
                    assignment_id: assignmentId,
                    job_id: assignment.job_id,
                    candidate_id: assignment.candidate_id,
                    recruiter_id: assignment.recruiter_id,
                    reason,
                },
                'network-service'
            );
        }

        return updated;
    }

    /**
     * Mark a proposal as submitted (recruiter submitted the candidate).
     */
    async markAsSubmitted(assignmentId: string): Promise<CandidateRoleAssignment> {
        const assignment = await this.repository.getCandidateRoleAssignmentById(assignmentId);
        if (!assignment) {
            throw new Error(`Assignment ${assignmentId} not found`);
        }

        if (assignment.state !== 'accepted') {
            throw new Error(`Can only submit from accepted state, current state: ${assignment.state}`);
        }

        return await this.repository.updateCandidateRoleAssignment(assignmentId, {
            state: 'submitted',
            submitted_at: new Date(),
        });
    }

    /**
     * Close an assignment (final state).
     */
    async closeAssignment(assignmentId: string): Promise<CandidateRoleAssignment> {
        const assignment = await this.repository.getCandidateRoleAssignmentById(assignmentId);
        if (!assignment) {
            throw new Error(`Assignment ${assignmentId} not found`);
        }

        return await this.repository.updateCandidateRoleAssignment(assignmentId, {
            state: 'closed',
            closed_at: new Date(),
        });
    }

    /**
     * Process timed-out proposals (run periodically).
     */
    async processTimeouts(): Promise<number> {
        const timedOut = await this.repository.findTimedOutProposals();
        let count = 0;

        for (const assignment of timedOut) {
            await this.repository.updateCandidateRoleAssignment(assignment.id, {
                state: 'timed_out',
                timed_out_at: new Date(),
            });

            // Publish event
            if (this.eventPublisher) {
                await this.eventPublisher.publish(
                    'proposal.timed_out',
                    {
                        assignment_id: assignment.id,
                        job_id: assignment.job_id,
                        candidate_id: assignment.candidate_id,
                        recruiter_id: assignment.recruiter_id,
                    },
                    'network-service'
                );
            }

            count++;
        }

        return count;
    }

    /**
     * Get all proposals for a recruiter.
     */
    async getRecruiterProposals(
        recruiterId: string,
        state?: CandidateRoleAssignmentState
    ): Promise<CandidateRoleAssignment[]> {
        return await this.repository.findCandidateRoleAssignmentsByRecruiter(recruiterId, state);
    }

    /**
     * Get all proposals for a job.
     */
    async getJobProposals(
        jobId: string,
        state?: CandidateRoleAssignmentState
    ): Promise<CandidateRoleAssignment[]> {
        return await this.repository.findCandidateRoleAssignmentsByJob(jobId, state);
    }

    /**
     * Check if a recruiter can work on a candidate for a specific job.
     */
    async canRecruiterWorkOnCandidate(
        recruiterId: string,
        candidateId: string,
        jobId: string
    ): Promise<{ allowed: boolean; reason?: string }> {
        const assignment = await this.repository.findCandidateRoleAssignment(jobId, candidateId);

        if (!assignment) {
            return { allowed: true };
        }

        if (assignment.recruiter_id === recruiterId) {
            if (assignment.state === 'accepted' || assignment.state === 'submitted') {
                return { allowed: true };
            }
            return { 
                allowed: false, 
                reason: `Your proposal is in ${assignment.state} state` 
            };
        }

        // Another recruiter is working on this candidate for this job
        return { 
            allowed: false, 
            reason: `Another recruiter is already working on this candidate for this job` 
        };
    }
}
