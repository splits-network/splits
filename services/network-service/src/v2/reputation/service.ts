/**
 * Reputation Service - Business logic for recruiter reputation
 */

import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { ReputationRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { ReputationFilters, ReputationUpdate } from './types';

export class ReputationServiceV2 {
    constructor(
        private repository: ReputationRepository,
        private eventPublisher: IEventPublisher
    ) {}

    async getReputations(
        clerkUserId: string,
        filters: ReputationFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findReputations(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getReputation(id: string): Promise<any> {
        const reputation = await this.repository.findReputation(id);
        if (!reputation) {
            throw { statusCode: 404, message: 'Reputation record not found' };
        }
        return reputation;
    }

    async createReputation(
        data: {
            recruiter_id: string;
            rating?: number;
            total_placements?: number;
            successful_placements?: number;
            average_time_to_placement_days?: number;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation
        if (!data.recruiter_id) {
            throw { statusCode: 400, message: 'recruiter_id is required' };
        }

        // Check if reputation already exists for this recruiter
        const existing = await this.repository.findReputationByRecruiterId(data.recruiter_id);
        if (existing) {
            throw { statusCode: 409, message: 'Reputation record already exists for this recruiter' };
        }

        // Validate rating if provided
        if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
            throw { statusCode: 400, message: 'Rating must be between 0 and 5' };
        }

        // Validate placement counts
        if (data.total_placements !== undefined && data.total_placements < 0) {
            throw { statusCode: 400, message: 'Total placements cannot be negative' };
        }
        if (data.successful_placements !== undefined && data.successful_placements < 0) {
            throw { statusCode: 400, message: 'Successful placements cannot be negative' };
        }
        if (
            data.total_placements !== undefined &&
            data.successful_placements !== undefined &&
            data.successful_placements > data.total_placements
        ) {
            throw { statusCode: 400, message: 'Successful placements cannot exceed total placements' };
        }

        const reputation = await this.repository.createReputation({
            ...data,
            rating: data.rating || 0,
            total_placements: data.total_placements || 0,
            successful_placements: data.successful_placements || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish event
        await this.eventPublisher.publish('reputation.created', {
                reputationId: reputation.id,
                recruiterId: reputation.recruiter_id,
            });

        return reputation;
    }

    async updateReputation(
        id: string,
        updates: ReputationUpdate,
        clerkUserId: string
    ): Promise<any> {
        // Validation based on what's being updated
        if (updates.rating !== undefined && (updates.rating < 0 || updates.rating > 5)) {
            throw { statusCode: 400, message: 'Rating must be between 0 and 5' };
        }

        if (updates.total_placements !== undefined && updates.total_placements < 0) {
            throw { statusCode: 400, message: 'Total placements cannot be negative' };
        }

        if (updates.successful_placements !== undefined && updates.successful_placements < 0) {
            throw { statusCode: 400, message: 'Successful placements cannot be negative' };
        }

        // Get current to validate successful vs total
        const current = await this.repository.findReputation(id);
        if (!current) {
            throw { statusCode: 404, message: 'Reputation record not found' };
        }

        const newTotal = updates.total_placements ?? current.total_placements;
        const newSuccessful = updates.successful_placements ?? current.successful_placements;

        if (newSuccessful > newTotal) {
            throw { statusCode: 400, message: 'Successful placements cannot exceed total placements' };
        }

        const reputation = await this.repository.updateReputation(id, updates);

        // Publish event
        await this.eventPublisher.publish('reputation.updated', {
            reputationId: id,
            updates: Object.keys(updates),
        });

        return reputation;
    }

    async deleteReputation(id: string, clerkUserId: string): Promise<void> {
        await this.repository.deleteReputation(id);

        // Publish event
        await this.eventPublisher.publish('reputation.deleted', {
            reputationId: id,
        });
    }
}
