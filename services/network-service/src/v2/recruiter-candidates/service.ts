/**
 * Recruiter-Candidate Service - Business logic for recruiter-candidate relationships
 */

import { EventPublisherV2 } from '../shared/events';
import { RecruiterCandidateRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { RecruiterCandidateFilters, RecruiterCandidateUpdate } from './types';

export class RecruiterCandidateServiceV2 {
    constructor(
        private repository: RecruiterCandidateRepository,
        private eventPublisher: EventPublisherV2
    ) {}

    async getRecruiterCandidates(
        clerkUserId: string,
        filters: RecruiterCandidateFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findRecruiterCandidates(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getRecruiterCandidate(id: string): Promise<any> {
        const relationship = await this.repository.findRecruiterCandidate(id);
        if (!relationship) {
            throw { statusCode: 404, message: 'Recruiter-Candidate relationship not found' };
        }
        return relationship;
    }

    async createRecruiterCandidate(
        data: {
            recruiter_id: string;
            candidate_id: string;
            relationship_type?: string;
            status?: string;
            notes?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation
        if (!data.recruiter_id || !data.candidate_id) {
            throw { statusCode: 400, message: 'recruiter_id and candidate_id are required' };
        }

        const relationship = await this.repository.createRecruiterCandidate({
            ...data,
            relationship_type: data.relationship_type || 'represented',
            status: data.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish event
        await this.eventPublisher.publish('recruiter_candidate.created', {
                relationshipId: relationship.id,
                recruiterId: relationship.recruiter_id,
                candidateId: relationship.candidate_id,
            });

        return relationship;
    }

    async updateRecruiterCandidate(
        id: string,
        updates: RecruiterCandidateUpdate,
        clerkUserId: string
    ): Promise<any> {
        // Status validation
        if (updates.status) {
            const validStatuses = ['active', 'inactive', 'blocked'];
            if (!validStatuses.includes(updates.status)) {
                throw {
                    statusCode: 400,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                };
            }
        }

        const relationship = await this.repository.updateRecruiterCandidate(id, updates);

        // Publish event
        await this.eventPublisher.publish('recruiter_candidate.updated', {
                relationshipId: id,
                updates: Object.keys(updates),
            });

        return relationship;
    }

    async deleteRecruiterCandidate(id: string, clerkUserId: string): Promise<void> {
        await this.repository.deleteRecruiterCandidate(id);

        // Publish event
        await this.eventPublisher.publish('recruiter_candidate.deleted', {
                relationshipId: id,
            });
    }
}
