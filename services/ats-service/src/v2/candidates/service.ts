/**
 * Candidates Service - V2
 * Handles ALL candidate updates with smart validation
 */

import { CandidateRepository } from './repository';
import { CandidateFilters, CandidateUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';

export class CandidateServiceV2 {
    constructor(
        private repository: CandidateRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async getCandidates(
        clerkUserId: string,
        filters: CandidateFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findCandidates(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse<any>(data, total, page, limit).pagination,
        };
    }

    async getCandidate(id: string): Promise<any> {
        const candidate = await this.repository.findCandidate(id);
        if (!candidate) {
            throw new Error(`Candidate ${id} not found`);
        }
        return candidate;
    }

    async createCandidate(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.first_name || !data.last_name) {
            throw new Error('Candidate first name and last name are required');
        }
        if (!data.email) {
            throw new Error('Candidate email is required');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }

        const candidate = await this.repository.createCandidate({
            ...data,
            status: data.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Emit event
            if (this.eventPublisher) {
                await this.eventPublisher.publish('candidate.created', {
                    candidateId: candidate.id,
                    email: candidate.email,
                    createdBy: clerkUserId,
                });
        }

        return candidate;
    }

    async updateCandidate(
        id: string,
        updates: CandidateUpdate,
        clerkUserId?: string
    ): Promise<any> {
        const currentCandidate = await this.repository.findCandidate(id);
        if (!currentCandidate) {
            throw new Error(`Candidate ${id} not found`);
        }

        // Validation
        if (updates.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updates.email)) {
                throw new Error('Invalid email format');
            }
        }

        if (updates.first_name !== undefined && !updates.first_name.trim()) {
            throw new Error('First name cannot be empty');
        }

        if (updates.last_name !== undefined && !updates.last_name.trim()) {
            throw new Error('Last name cannot be empty');
        }

        const updatedCandidate = await this.repository.updateCandidate(id, updates);

        // Emit event
            if (this.eventPublisher) {
                await this.eventPublisher.publish('candidate.updated', {
                    candidateId: id,
                    updatedFields: Object.keys(updates),
                    updatedBy: clerkUserId,
                });
        }

        return updatedCandidate;
    }

    async deleteCandidate(id: string, clerkUserId?: string): Promise<void> {
        const candidate = await this.repository.findCandidate(id);
        if (!candidate) {
            throw new Error(`Candidate ${id} not found`);
        }

        await this.repository.deleteCandidate(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('candidate.deleted', {
                candidateId: id,
                deletedBy: clerkUserId,
            });
        }
    }
}
