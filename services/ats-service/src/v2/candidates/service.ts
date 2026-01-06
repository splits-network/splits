/**
 * Candidates Service - V2
 * Handles ALL candidate updates with smart validation
 */

import { CandidateRepository } from './repository';
import { CandidateFilters, CandidateUpdate, CandidateDashboardStats, RecentCandidateApplication } from './types';
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

        const { data, pagination: {total} } = await this.repository.findCandidates(clerkUserId, {
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

        if (clerkUserId) {
            const accessContext = await this.repository.getAccessContext(clerkUserId);
            const canManage =
                accessContext.isPlatformAdmin ||
                accessContext.recruiterId !== null ||
                accessContext.roles.some(role =>
                    ['company_admin', 'hiring_manager', 'platform_admin'].includes(role)
                );
            const isOwnProfile = accessContext.candidateId === id;

            if (!canManage && !isOwnProfile) {
                throw new Error('You do not have permission to update this candidate');
            }

            // Authorization check: only recruiters and platform admins can update verification status
            if (updates.verification_status !== undefined) {
                const canVerify = accessContext.isPlatformAdmin || accessContext.recruiterId !== null;
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
        const accessContext = await this.repository.getAccessContext(clerkUserId);
        if (!accessContext.candidateId) {
            return [];
        }
        return this.repository.getRecentCandidateApplications(accessContext.candidateId, limit);
    }
}
