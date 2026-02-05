/**
 * Candidates Service - V2
 * Handles ALL candidate updates with smart validation
 */

import { CandidateRepository } from './repository';
import { CandidateFilters, CandidateUpdate, CandidateDashboardStats, RecentCandidateApplication } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: CandidateRepository,
        supabase: SupabaseClient,
        private eventPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getCandidates(
        clerkUserId: string,
        filters: CandidateFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, pagination: { total } } = await this.repository.findCandidates(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse<any>(data, total, page, limit).pagination,
        };
    }

    async getCandidate(id: string, clerkUserId?: string): Promise<any> {
        const candidate = await this.repository.findCandidate(id, clerkUserId);
        if (!candidate) {
            throw new Error(`Candidate ${id} not found`);
        }
        return candidate;
    }

    async getCandidateByClerkId(clerkUserId: string): Promise<any> {
        const candidate = await this.repository.findCandidateByClerkId(clerkUserId);
        if (!candidate) {
            throw new Error(`Candidate for Clerk User ID ${clerkUserId} not found`);
        }
        return candidate;
    }

    async createCandidate(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.full_name) {
            throw new Error('Candidate full name is required');
        }
        if (!data.email) {
            throw new Error('Candidate email is required');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        const candidate = await this.repository.createCandidate({
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('candidate.created', {
                candidateId: candidate.id,
                email: candidate.email,
                createdBy: userContext.identityUserId,
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

        if (clerkUserId) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            const canManage =
                userContext.isPlatformAdmin ||
                userContext.recruiterId !== null ||
                userContext.roles.some(role =>
                    ['company_admin', 'hiring_manager', 'platform_admin'].includes(role)
                );
            const isOwnProfile = userContext.candidateId === id;

            if (!canManage && !isOwnProfile) {
                throw new Error('You do not have permission to update this candidate');
            }

            // Authorization check: only recruiters and platform admins can update verification status
            if (updates.verification_status !== undefined) {
                const canVerify = userContext.isPlatformAdmin || userContext.recruiterId !== null;
                if (!canVerify) {
                    throw new Error('Only recruiters and platform admins can update verification status');
                }

                // Smart verification handling: set verified_by and verified_at when status changes
                if (!updates.verified_by_user_id) {
                    // Get the internal user_id from users for verified_by_user_id
                    const { data: verifierUser } = await this.repository['supabase']
                        .from('users')
                        .select('id')
                        .eq('clerk_user_id', clerkUserId)
                        .single();

                    if (verifierUser) {
                        updates.verified_by_user_id = verifierUser.id;
                    }
                }

                if (!updates.verified_at) {
                    updates.verified_at = new Date().toISOString();
                }
            }
        }

        // Validation
        if (updates.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updates.email)) {
                throw new Error('Invalid email format');
            }
        }

        if (updates.full_name !== undefined && !updates.full_name.trim()) {
            throw new Error('First name cannot be empty');
        }



        const userContext = await this.accessResolver.resolve(clerkUserId);
        const updatedCandidate = await this.repository.updateCandidate(id, updates);

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('candidate.updated', {
                candidateId: id,
                updatedFields: Object.keys(updates),
                updatedBy: userContext.identityUserId,
            });
        }

        return updatedCandidate;
    }

    async deleteCandidate(id: string, clerkUserId?: string): Promise<void> {
        const candidate = await this.repository.findCandidate(id);
        if (!candidate) {
            throw new Error(`Candidate ${id} not found`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.deleteCandidate(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('candidate.deleted', {
                candidateId: id,
                deletedBy: userContext.identityUserId,
            });
        }
    }

    async getCandidateDashboardStats(clerkUserId: string): Promise<CandidateDashboardStats> {
        const accessContext = await this.repository.getAccessContext(clerkUserId);
        if (!accessContext.candidateId) {
            return {
                applications: 0,
                interviews: 0,
                offers: 0,
                active_relationships: 0,
            };
        }
        return this.repository.getCandidateDashboardStats(accessContext.candidateId);
    }

    async getCandidateRecentApplications(
        clerkUserId: string,
        limit = 5
    ): Promise<RecentCandidateApplication[]> {

        const userContext = await this.accessResolver.resolve(clerkUserId);
        if (!userContext.candidateId) {
            return [];
        }
        return this.repository.getRecentCandidateApplications(userContext.candidateId, limit);
    }

    /**
     * Get all resumes for a candidate (for primary resume selection)
     */
    async getCandidateResumes(candidateId: string, clerkUserId?: string): Promise<any[]> {
        // Verify access to this candidate
        if (clerkUserId) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            const canAccess =
                userContext.isPlatformAdmin ||
                userContext.recruiterId !== null ||
                userContext.roles.some(role =>
                    ['company_admin', 'hiring_manager', 'platform_admin'].includes(role)
                ) ||
                userContext.candidateId === candidateId;

            if (!canAccess) {
                throw new Error('You do not have permission to view this candidates documents');
            }
        }

        return this.repository.getCandidateResumes(candidateId);
    }

    /**
     * Set primary resume for a candidate using document metadata
     */
    async setPrimaryResume(candidateId: string, resumeId: string, clerkUserId: string): Promise<any> {
        // Verify access and that the resume belongs to the candidate
        const userContext = await this.accessResolver.resolve(clerkUserId);
        const canAccess =
            userContext.isPlatformAdmin ||
            userContext.candidateId === candidateId;

        if (!canAccess) {
            throw new Error('You do not have permission to update this candidate\'s primary resume');
        }

        return this.repository.setCandidatePrimaryResume(candidateId, resumeId);
    }

    /**
     * Clear primary resume for a candidate
     */
    async clearPrimaryResume(candidateId: string, clerkUserId: string): Promise<any> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        const canAccess =
            userContext.isPlatformAdmin ||
            userContext.candidateId === candidateId;

        if (!canAccess) {
            throw new Error('You do not have permission to update this candidate\'s primary resume');
        }

        return this.repository.clearCandidatePrimaryResume(candidateId);
    }
}
