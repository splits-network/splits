import { NetworkRepository } from './repository';
import {
    CandidateRoleAssignment,
    CandidateRoleAssignmentState,
    RecruiterReputation,
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

/**
 * Phase 2: Recruiter Reputation Service
 * 
 * Aggregates and calculates reputation metrics for recruiters.
 */
export class RecruiterReputationService {
    constructor(
        private repository: NetworkRepository,
        private eventPublisher?: any
    ) {}

    /**
     * Get reputation for a recruiter.
     */
    async getRecruiterReputation(recruiterId: string): Promise<RecruiterReputation> {
        const reputation = await this.repository.findRecruiterReputation(recruiterId);
        if (!reputation) {
            // Initialize if doesn't exist
            return await this.repository.createRecruiterReputation(recruiterId);
        }
        return reputation;
    }

    /**
     * Recalculate reputation metrics for a recruiter.
     * This would be called after major events (hire, placement completion, etc.)
     */
    async recalculateReputation(recruiterId: string): Promise<RecruiterReputation> {
        const current = await this.getRecruiterReputation(recruiterId);
        const oldScore = current.reputation_score;

        // Calculate rates
        const hireRate = current.total_submissions > 0 
            ? (current.total_hires / current.total_submissions) * 100 
            : null;

        const completionRate = current.total_placements > 0
            ? (current.completed_placements / current.total_placements) * 100
            : null;

        const collaborationRate = current.total_placements > 0
            ? (current.total_collaborations / current.total_placements) * 100
            : null;

        // Calculate overall score (0-100)
        // Weighted formula:
        // - Hire rate: 40%
        // - Completion rate: 30%
        // - Collaboration rate: 15%
        // - Responsiveness: 15%
        let score = 50.0; // Start at 50 (neutral)

        if (hireRate !== null) {
            score += (hireRate * 0.4) - 20; // Normalize around 50
        }

        if (completionRate !== null) {
            score += (completionRate * 0.3) - 15;
        }

        if (collaborationRate !== null) {
            score += (collaborationRate * 0.15) - 7.5;
        }

        // Responsiveness factor (fewer timeouts = better)
        const totalProposals = current.proposals_accepted + current.proposals_declined + current.proposals_timed_out;
        if (totalProposals > 0) {
            const responseRate = ((current.proposals_accepted + current.proposals_declined) / totalProposals) * 100;
            score += (responseRate * 0.15) - 7.5;
        }

        // Clamp between 0 and 100
        score = Math.max(0, Math.min(100, score));

        const updates: Partial<RecruiterReputation> = {
            hire_rate: hireRate ?? undefined,
            completion_rate: completionRate ?? undefined,
            collaboration_rate: collaborationRate ?? undefined,
            reputation_score: score,
            last_calculated_at: new Date(),
        };

        const updated = await this.repository.updateRecruiterReputation(recruiterId, updates);

        // Publish event if score changed significantly
        if (this.eventPublisher && Math.abs(score - oldScore) >= 5) {
            await this.eventPublisher.publish(
                'reputation.updated',
                {
                    recruiter_id: recruiterId,
                    old_score: oldScore,
                    new_score: score,
                    reason: 'recalculation',
                },
                'network-service'
            );
        }

        return updated;
    }

    /**
     * Increment submission count.
     */
    async incrementSubmissions(recruiterId: string): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        await this.repository.updateRecruiterReputation(recruiterId, {
            total_submissions: reputation.total_submissions + 1,
        });
    }

    /**
     * Increment hire count.
     */
    async incrementHires(recruiterId: string): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        await this.repository.updateRecruiterReputation(recruiterId, {
            total_hires: reputation.total_hires + 1,
        });
        // Recalculate after hire
        await this.recalculateReputation(recruiterId);
    }

    /**
     * Record a placement outcome.
     */
    async recordPlacementOutcome(
        recruiterId: string,
        completed: boolean,
        wasCollaboration: boolean
    ): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        
        const updates: any = {
            total_placements: reputation.total_placements + 1,
        };

        if (completed) {
            updates.completed_placements = reputation.completed_placements + 1;
        } else {
            updates.failed_placements = reputation.failed_placements + 1;
        }

        if (wasCollaboration) {
            updates.total_collaborations = reputation.total_collaborations + 1;
        }

        await this.repository.updateRecruiterReputation(recruiterId, updates);
        await this.recalculateReputation(recruiterId);
    }

    /**
     * Record a proposal response.
     */
    async recordProposalResponse(
        recruiterId: string,
        response: 'accepted' | 'declined' | 'timed_out'
    ): Promise<void> {
        const reputation = await this.getRecruiterReputation(recruiterId);
        
        const updates: any = {};
        
        if (response === 'accepted') {
            updates.proposals_accepted = reputation.proposals_accepted + 1;
        } else if (response === 'declined') {
            updates.proposals_declined = reputation.proposals_declined + 1;
        } else if (response === 'timed_out') {
            updates.proposals_timed_out = reputation.proposals_timed_out + 1;
        }

        await this.repository.updateRecruiterReputation(recruiterId, updates);
        await this.recalculateReputation(recruiterId);
    }

    /**
     * Get top recruiters by reputation score.
     */
    async getTopRecruiters(limit: number = 10): Promise<RecruiterReputation[]> {
        return await this.repository.findTopRecruitersByReputation(limit);
    }
}
