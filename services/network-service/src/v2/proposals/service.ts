/**
 * Proposal Service - Business logic for candidate proposals
 */

import { EventPublisherV2 } from '../shared/events';
import { ProposalRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { ProposalFilters, ProposalUpdate } from './types';

export class ProposalServiceV2 {
    constructor(
        private repository: ProposalRepository,
        private eventPublisher: EventPublisherV2
    ) {}

    async getProposals(
        clerkUserId: string,
        filters: ProposalFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findProposals(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getProposal(id: string): Promise<any> {
        const proposal = await this.repository.findProposal(id);
        if (!proposal) {
            throw { statusCode: 404, message: 'Proposal not found' };
        }
        return proposal;
    }

    async createProposal(
        data: {
            recruiter_id: string;
            job_id: string;
            candidate_id: string;
            notes?: string;
            state?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation
        if (!data.recruiter_id || !data.job_id || !data.candidate_id) {
            throw {
                statusCode: 400,
                message: 'recruiter_id, job_id, and candidate_id are required',
            };
        }

        const proposal = await this.repository.createProposal({
            ...data,
            state: data.state || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish event
        await this.eventPublisher.publish('proposal.created', {
            proposalId: proposal.id,
            recruiterId: proposal.recruiter_id,
            jobId: proposal.job_id,
            candidateId: proposal.candidate_id,
        });

        return proposal;
    }

    async updateProposal(
        id: string,
        updates: ProposalUpdate,
        clerkUserId: string
    ): Promise<any> {
        // State transition validation
        if (updates.state) {
            const current = await this.repository.findProposal(id);
            if (!current) {
                throw { statusCode: 404, message: 'Proposal not found' };
            }
            this.validateStateTransition(current.state, updates.state);
        }

        const proposal = await this.repository.updateProposal(id, updates);

        // Publish event
        await this.eventPublisher.publish('proposal.updated', {
            proposalId: id,
            updates: Object.keys(updates),
            newState: updates.state,
        });

        return proposal;
    }

    async deleteProposal(id: string, clerkUserId: string): Promise<void> {
        await this.repository.deleteProposal(id);

        // Publish event
        await this.eventPublisher.publish('proposal.deleted', {
                proposalId: id,
            });
    }

    // Private helpers

    private validateStateTransition(currentState: string, newState: string): void {
        const validTransitions: Record<string, string[]> = {
            pending: ['reviewing', 'rejected', 'cancelled'],
            reviewing: ['approved', 'rejected', 'cancelled'],
            approved: ['accepted', 'rejected', 'cancelled'],
            accepted: ['completed', 'cancelled'],
            rejected: [], // Terminal state
            cancelled: [], // Terminal state
            completed: [], // Terminal state
        };

        const allowed = validTransitions[currentState] || [];
        if (!allowed.includes(newState)) {
            throw {
                statusCode: 400,
                message: `Cannot transition proposal from ${currentState} to ${newState}`,
            };
        }
    }
}
