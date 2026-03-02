/**
 * Recruiter Service - Business logic for recruiters
 */

import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { RecruiterRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { RecruiterFilters, RecruiterUpdate } from './types';

export class RecruiterServiceV2 {
    constructor(
        private repository: RecruiterRepository,
        private eventPublisher: IEventPublisher
    ) { }

    async getRecruiters(
        clerkUserId: string | undefined,
        filters: RecruiterFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findRecruiters(clerkUserId, filters);

        // Flatten reputation data if included
        const flattenedData = result.data.map(recruiter => this.flattenRecruiterData(recruiter));

        return buildPaginationResponse(
            flattenedData,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getRecruiter(id: string, clerkUserId: string | undefined, include?: string): Promise<any> {
        const recruiter = await this.repository.findRecruiter(id, clerkUserId, include);
        if (!recruiter) {
            throw { statusCode: 404, message: 'Recruiter not found' };
        }
        return this.flattenRecruiterData(recruiter);
    }

    async getRecruiterBySlug(slug: string, clerkUserId?: string, include?: string): Promise<any> {
        const recruiter = await this.repository.findRecruiterBySlug(slug, include);
        if (!recruiter) {
            throw { statusCode: 404, message: 'Recruiter not found' };
        }
        return this.flattenRecruiterData(recruiter);
    }

    async getRecruiterByClerkId(clerkUserId: string): Promise<any> {
        const recruiter = await this.repository.findByClerkUserId(clerkUserId);
        if (!recruiter) {
            throw { statusCode: 404, message: 'Recruiter profile not found' };
        }
        return recruiter;
    }

    async createRecruiter(
        data: {
            user_id: string;
            bio?: string;
            phone?: string;
            industries?: string[];
            specialization?: string;
            location?: string;
            taglines?: string[];
            years_experience?: number;
            status?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Check if recruiter already exists for this user
        const existing = await this.repository.findRecruiterByUserId(data.user_id);
        if (existing) {
            throw { statusCode: 409, message: 'Recruiter profile already exists for this user' };
        }

        // Auto-generate slug from name if not provided
        let slug: string | undefined;
        if (data.user_id) {
            const user = await this.repository.findRecruiterByUserId(data.user_id);
            // If no existing recruiter, try to generate slug from any available name
            const nameForSlug = (data as any).name;
            if (nameForSlug) {
                slug = await this.generateUniqueSlug(nameForSlug);
            }
        }

        const recruiter = await this.repository.createRecruiter({
            ...data,
            ...(slug ? { slug } : {}),
            status: data.status || 'active',  //may be changed to 'pending' based on requirements
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Create user_role entry for the recruiter
        if (recruiter.user_id && recruiter.status === 'active') {
            await this.repository.createRecruiterUserRole(recruiter.user_id, recruiter.id);
        }

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

        // Slug validation
        if (updates.slug !== undefined) {
            if (updates.slug) {
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updates.slug)) {
                    throw { statusCode: 400, message: 'Slug must be lowercase alphanumeric with hyphens only' };
                }
                const taken = await this.repository.isSlugTaken(updates.slug, id);
                if (taken) {
                    throw { statusCode: 409, message: 'This slug is already taken' };
                }
            }
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

        // When status transitions to 'active', ensure user_roles entry exists
        // This handles the invited-recruiter flow: created as 'pending', later activated
        if (updates.status === 'active' && recruiter.user_id) {
            await this.repository.createRecruiterUserRole(recruiter.user_id, recruiter.id);
        }

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
        await this.eventPublisher.publish('recruiter.deleted', {
            recruiterId: id,
        });
    }

    // Private helpers

    /**
     * Flatten nested reputation data into recruiter object for easier frontend consumption
     */
    private flattenRecruiterData(recruiter: any): any {
        if (!recruiter) return recruiter;

        const { recruiter_reputation, firm_members, ...rest } = recruiter;

        // Flatten firm data — take first firm membership's firm name
        if (firm_members && Array.isArray(firm_members) && firm_members.length > 0) {
            const membership = firm_members[0];
            rest.firm_name = membership.firms?.name || null;
            rest.firm_slug = membership.firms?.slug || null;
            rest.firm_role = membership.role || null;
        }

        // Helper to extract reputation fields from a reputation record
        const flattenReputation = (rep: any) => ({
            ...rest,
            reputation_score: rep.reputation_score,
            total_submissions: rep.total_submissions,
            total_hires: rep.total_hires,
            hire_rate: rep.hire_rate,
            completion_rate: rep.completion_rate,
            total_placements: rep.total_placements,
            completed_placements: rep.completed_placements,
            failed_placements: rep.failed_placements,
            total_collaborations: rep.total_collaborations,
            collaboration_rate: rep.collaboration_rate,
            avg_response_time_hours: rep.avg_response_time_hours,
        });

        // If reputation data exists, flatten it into the recruiter object
        if (recruiter_reputation && Array.isArray(recruiter_reputation) && recruiter_reputation.length > 0) {
            return flattenReputation(recruiter_reputation[0]);
        }

        // If reputation is a single object (not array)
        if (recruiter_reputation && !Array.isArray(recruiter_reputation)) {
            return flattenReputation(recruiter_reputation);
        }

        return rest;
    }

    /**
     * Generate a unique slug from a name, appending -2, -3, etc. if taken
     */
    private async generateUniqueSlug(name: string): Promise<string> {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        if (!base) return '';

        let slug = base;
        let counter = 2;
        while (await this.repository.isSlugTaken(slug)) {
            slug = `${base}-${counter}`;
            counter++;
        }
        return slug;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private validateStatusTransition(currentStatus: string, newStatus: string): void {
        const validTransitions: Record<string, string[]> = {
            pending: ['active', 'suspended'],
            active: ['suspended', 'inactive'],
            suspended: ['active', 'inactive'],
            inactive: ['active'],
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
