/**
 * Recruiter Service - Business logic for recruiters
 */

import { EventPublisherV2 } from '../shared/events';
import { RecruiterRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { RecruiterFilters, RecruiterUpdate } from './types';

export class RecruiterServiceV2 {
    constructor(
        private repository: RecruiterRepository,
        private eventPublisher: EventPublisherV2
    ) {}

    async getRecruiters(
        clerkUserId: string | undefined,
        filters: RecruiterFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findRecruiters(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getRecruiter(id: string, clerkUserId: string | undefined): Promise<any> {
        const recruiter = await this.repository.findRecruiter(id, clerkUserId);
        if (!recruiter) {
            throw { statusCode: 404, message: 'Recruiter not found' };
        }
        return recruiter;
    }

    async createRecruiter(
        data: {
            user_id: string;
            name: string;
            email: string;
            phone?: string;
            specialization?: string;
            bio?: string;
            status?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation: name and email are required
        if (!data.name || data.name.trim().length === 0) {
            throw { statusCode: 400, message: 'Name is required' };
        }
        if (!data.email || !this.isValidEmail(data.email)) {
            throw { statusCode: 400, message: 'Valid email is required' };
        }

        // Check if recruiter already exists for this user
        const existing = await this.repository.findRecruiterByUserId(data.user_id);
        if (existing) {
            throw { statusCode: 409, message: 'Recruiter profile already exists for this user' };
        }

        const recruiter = await this.repository.createRecruiter({
            ...data,
            status: data.status || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish event
        await this.eventPublisher.publish('recruiter.created', {
            recruiterId: recruiter.id,
            userId: recruiter.user_id,
            status: recruiter.status,
        });

        return recruiter;
    }

    async updateRecruiter(
        id: string,
        updates: RecruiterUpdate,
        clerkUserId: string
    ): Promise<any> {
        // Validation based on what's being updated
        if (updates.email && !this.isValidEmail(updates.email)) {
            throw { statusCode: 400, message: 'Invalid email format' };
        }
        if (updates.name !== undefined && updates.name.trim().length === 0) {
            throw { statusCode: 400, message: 'Name cannot be empty' };
        }

        // Status transition validation
        if (updates.status) {
            const current = await this.repository.findRecruiter(id, clerkUserId);
            if (!current) {
                throw { statusCode: 404, message: 'Recruiter not found' };
            }
            this.validateStatusTransition(current.status, updates.status);
        }

        const recruiter = await this.repository.updateRecruiter(id, updates);

        // Publish event
        await this.eventPublisher.publish('recruiter.updated', {
            recruiterId: id,
            updates: Object.keys(updates),
        });

        return recruiter;
    }

    async deleteRecruiter(id: string, clerkUserId: string): Promise<void> {
        await this.repository.deleteRecruiter(id);

        // Publish event
        await this.eventPublisher.publish('recruiter.deleted',{
                recruiterId: id,
            });
    }

    // Private helpers

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private validateStatusTransition(currentStatus: string, newStatus: string): void {
        const validTransitions: Record<string, string[]> = {
            pending: ['active', 'rejected'],
            active: ['inactive', 'suspended'],
            inactive: ['active'],
            suspended: ['active', 'inactive'],
            rejected: [], // Terminal state
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw {
                statusCode: 400,
                message: `Cannot transition recruiter from ${currentStatus} to ${newStatus}`,
            };
        }
    }
}
