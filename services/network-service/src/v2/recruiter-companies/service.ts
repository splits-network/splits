/**
 * Recruiter-Companies Service - V2
 * Handles business logic for recruiter-company relationship management
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompanyRepository } from './repository';
import { EventPublisherV2 } from '../shared/events';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import {
    RecruiterCompany,
    RecruiterCompanyCreate,
    RecruiterCompanyUpdate,
    RecruiterCompanyFilters,
    InviteRecruiterRequest,
    AcceptInvitationRequest,
    TerminateRelationshipRequest,
    RequestConnectionRequest
} from './types';

export class RecruiterCompanyServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: RecruiterCompanyRepository,
        supabase: SupabaseClient,
        private eventPublisher?: EventPublisherV2
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * List recruiter-company relationships with role-based filtering
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & RecruiterCompanyFilters
    ): Promise<StandardListResponse<RecruiterCompany>> {
        return await this.repository.list(clerkUserId, params);
    }

    /**
     * Get single relationship by ID
     */
    async getById(id: string, clerkUserId: string): Promise<RecruiterCompany> {
        const relationship = await this.repository.findById(id, clerkUserId);
        if (!relationship) {
            throw new Error('Recruiter-company relationship not found');
        }
        return relationship;
    }

    /**
     * Create new recruiter-company relationship (internal use)
     */
    async create(
        data: RecruiterCompanyCreate,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        
        // Validate relationship doesn't already exist
        const existingActive = await this.repository.hasActiveRelationship(
            data.recruiter_id,
            data.company_id
        );
        
        if (existingActive && data.relationship_type === 'recruiter') {
            throw new Error('Active recruiter relationship already exists for this company');
        }

        const relationship = await this.repository.create(data, clerkUserId);

        // Publish event
        await this.eventPublisher?.publish('recruiter_company.created', {
            relationshipId: relationship.id,
            recruiterId: relationship.recruiter_id,
            companyId: relationship.company_id,
            relationshipType: relationship.relationship_type,
            createdBy: userContext.identityUserId
        });

        return relationship;
    }

    /**
     * Invite recruiter to work with company
     */
    async inviteRecruiter(
        request: InviteRecruiterRequest,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        
        // Find recruiter by email
        const recruiter = await this.repository.findRecruiterByEmail(request.recruiter_email);
        if (!recruiter) {
            throw new Error(`Recruiter not found with email: ${request.recruiter_email}`);
        }

        // Check if relationship already exists
        const existingActive = await this.repository.hasActiveRelationship(
            recruiter.id,
            request.company_id
        );
        
        if (existingActive) {
            throw new Error('Recruiter is already actively working with this company');
        }

        // Create pending relationship
        const relationship = await this.repository.create({
            recruiter_id: recruiter.id,
            company_id: request.company_id,
            relationship_type: 'recruiter',
            can_manage_company_jobs: request.can_manage_company_jobs || false,
            invited_by: userContext.identityUserId || undefined
        }, clerkUserId);

        // Publish invitation event for notification service
        await this.eventPublisher?.publish('recruiter_company.invited', {
            relationshipId: relationship.id,
            recruiterEmail: request.recruiter_email,
            recruiterId: recruiter.id,
            companyId: request.company_id,
            canManageJobs: request.can_manage_company_jobs || false,
            invitedBy: userContext.identityUserId,
            message: request.message
        });

        return relationship;
    }

    /**
     * Recruiter-initiated connection request to a company
     */
    async requestConnection(
        request: RequestConnectionRequest,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const userContext = await this.accessResolver.resolve(clerkUserId);

        if (!userContext.recruiterId) {
            throw new Error('Only recruiters can request company connections');
        }

        // Validate company exists
        const { data: company } = await this.repository['supabase']
            .from('companies')
            .select('id, name')
            .eq('id', request.company_id)
            .maybeSingle();

        if (!company) {
            throw new Error('Company not found');
        }

        // Check for existing active or pending relationship
        const existingRelationship = await this.repository.hasPendingOrActiveRelationship(
            userContext.recruiterId,
            request.company_id
        );

        if (existingRelationship) {
            throw new Error('An active or pending relationship already exists with this company');
        }

        // Create pending relationship via recruiter-specific method
        const relationship = await this.repository.createConnectionRequest({
            recruiter_id: userContext.recruiterId,
            company_id: request.company_id,
            relationship_type: request.relationship_type || 'recruiter',
            invited_by: userContext.identityUserId || undefined
        });

        // Publish event
        await this.eventPublisher?.publish('recruiter_company.connection_requested', {
            relationshipId: relationship.id,
            recruiterId: userContext.recruiterId,
            companyId: request.company_id,
            relationshipType: request.relationship_type || 'recruiter',
            requestedBy: userContext.identityUserId,
            message: request.message
        });

        return relationship;
    }

    /**
     * Accept or decline invitation
     */
    async respondToInvitation(
        relationshipId: string,
        accept: boolean,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const startTime = Date.now();
        console.log(`[RESPOND] Start - relationshipId: ${relationshipId}, accept: ${accept}`);

        const userContext = await this.accessResolver.resolve(clerkUserId);
        console.log(`[RESPOND] Access context resolved in ${Date.now() - startTime}ms - recruiterId: ${userContext.recruiterId}`);

        // Get the relationship and verify recruiter can respond
        const relationship = await this.repository.findById(relationshipId, clerkUserId);
        console.log(`[RESPOND] FindById completed in ${Date.now() - startTime}ms - found: ${!!relationship}`);

        if (!relationship) {
            throw new Error('Invitation not found or access denied');
        }

        if (relationship.status !== 'pending') {
            throw new Error('This invitation has already been responded to');
        }

        // Verify the current user is the invited recruiter
        console.log(`[RESPOND] Checking ownership - relationship.recruiter_id: ${relationship.recruiter_id}, userContext.recruiterId: ${userContext.recruiterId}`);
        if (relationship.recruiter_id !== userContext.recruiterId) {
            throw new Error('You can only respond to your own invitations');
        }

        const newStatus = accept ? 'active' : 'declined';
        const updates: RecruiterCompanyUpdate = { status: newStatus };

        const updatedRelationship = await this.repository.update(relationshipId, updates, clerkUserId);
        console.log(`[RESPOND] Update completed in ${Date.now() - startTime}ms`);

        // Publish response event
        const eventType = accept ? 'recruiter_company.accepted' : 'recruiter_company.declined';
        await this.eventPublisher?.publish(eventType, {
            relationshipId: relationship.id,
            recruiterId: relationship.recruiter_id,
            companyId: relationship.company_id,
            respondedBy: userContext.identityUserId
        });
        console.log(`[RESPOND] Event published, total time: ${Date.now() - startTime}ms`);

        return updatedRelationship;
    }

    /**
     * Update relationship (permissions, etc.)
     */
    async update(
        id: string,
        updates: RecruiterCompanyUpdate,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        
        const relationship = await this.repository.update(id, updates, clerkUserId);

        // Publish event if significant changes
        if (updates.status || updates.can_manage_company_jobs !== undefined) {
            await this.eventPublisher?.publish('recruiter_company.updated', {
                relationshipId: id,
                changes: Object.keys(updates),
                updatedBy: userContext.identityUserId
            });
        }

        return relationship;
    }

    /**
     * Terminate relationship
     */
    async terminateRelationship(
        id: string,
        request: TerminateRelationshipRequest,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        
        const relationship = await this.repository.update(id, {
            status: 'terminated',
            termination_reason: request.reason,
            relationship_end_date: new Date().toISOString(),
            terminated_by: userContext.identityUserId || undefined
        }, clerkUserId);

        // Publish termination event
        await this.eventPublisher?.publish('recruiter_company.terminated', {
            relationshipId: id,
            recruiterId: relationship.recruiter_id,
            companyId: relationship.company_id,
            reason: request.reason,
            terminatedBy: userContext.identityUserId
        });

        return relationship;
    }

    /**
     * Delete relationship (soft delete)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        
        const relationship = await this.repository.findById(id, clerkUserId);
        if (!relationship) {
            throw new Error('Relationship not found');
        }

        await this.repository.delete(id, clerkUserId);

        await this.eventPublisher?.publish('recruiter_company.deleted', {
            relationshipId: id,
            recruiterId: relationship.recruiter_id,
            companyId: relationship.company_id,
            deletedBy: userContext.identityUserId
        });
    }

    /**
     * Get all companies a recruiter can manage jobs for
     */
    async getManageableCompanies(recruiterId: string): Promise<string[]> {
        return await this.repository.getManageableCompanyIds(recruiterId);
    }

    /**
     * Check if recruiter can manage jobs for specific company
     */
    async canManageCompanyJobs(recruiterId: string, companyId: string): Promise<boolean> {
        const { data } = await this.repository.list('system', {
            recruiter_id: recruiterId,
            company_id: companyId,
            status: 'active',
            can_manage_company_jobs: true,
            limit: 1
        });

        return data.length > 0;
    }

    /**
     * Get all companies a recruiter can manage jobs for, with details
     */
    async getManageableCompaniesWithDetails(recruiterId: string): Promise<{ id: string; name: string }[]> {
        return await this.repository.getManageableCompaniesWithDetails(recruiterId);
    }
}