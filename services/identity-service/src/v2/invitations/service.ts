/**
 * V2 Invitation Service - Identity Service
 * Handles invitation lifecycle and events
 */

import { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2 } from '../shared/events';
import { InvitationUpdate } from './types';
import { InvitationRepository } from './repository';
import { UserRepository } from '../users/repository';
import { MembershipRepository } from '../memberships/repository';
import { v4 as uuidv4 } from 'uuid';
import type { AccessContext } from '../shared/access';

export class InvitationServiceV2 {
    constructor(
        private repository: InvitationRepository,
        private userRepository: UserRepository,
        private membershipRepository: MembershipRepository,
        private eventPublisher: EventPublisherV2,
        private logger: Logger,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>
    ) { }

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            this.logger.warn({ clerkUserId }, 'InvitationService - unauthorized access attempt');
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    private async requireCompanyAdminOrPlatformAdmin(
        clerkUserId: string,
        organizationId: string,
        companyId?: string | null
    ): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);

        // Platform admins can always proceed
        if (access.isPlatformAdmin) {
            return access;
        }

        // Check if user is company_admin
        if (!access.roles.includes('company_admin')) {
            this.logger.warn({ clerkUserId }, 'User does not have company_admin role');
            throw new Error('You must be a company admin');
        }

        // Check organization membership
        if (!access.organizationIds.includes(organizationId)) {
            this.logger.warn({ clerkUserId, organizationId }, 'User is not a member of this organization');
            throw new Error('You must be a member of this organization');
        }

        // If inviting to a specific company, verify user has access to that company
        // (either has that company_id in their companyIds, or has an org-level membership)
        if (companyId) {
            const hasCompanyAccess =
                access.companyIds.includes(companyId) ||
                access.companyIds.length === 0; // Allow if user has org-level membership (no company_ids)

            if (!hasCompanyAccess) {
                this.logger.warn({ clerkUserId, companyId, userCompanyIds: access.companyIds }, 'User does not have access to this company');
                throw new Error('You do not have access to this company');
            }
        }

        return access;
    }

    /**
     * Find all invitations with pagination and filters
     */
    async findInvitations(clerkUserId: string, filters: any) {
        // Allow company admins to view invitations for their organization
        if (filters.organization_id) {
            await this.requireCompanyAdminOrPlatformAdmin(
                clerkUserId,
                filters.organization_id,
                filters.company_id
            );
        } else {
            // If no organization filter, require platform admin
            await this.requirePlatformAdmin(clerkUserId);
        }

        this.logger.info({ filters }, 'InvitationService.findInvitations');
        const result = await this.repository.findInvitations(filters);
        return result;
    }

    /**
     * Find invitation by ID
     */
    async findInvitationById(clerkUserId: string, id: string, userEmail?: string) {
        this.logger.info({ id }, 'InvitationService.findInvitationById');
        const invitation = await this.repository.findInvitationById(id);
        if (!invitation) {
            throw new Error(`Invitation not found: ${id}`);
        }

        // Verify user has access to this invitation
        const access = await this.resolveAccessContext(clerkUserId);

        // Allow access if:
        // 1. User is platform admin, OR
        // 2. User is company admin for this organization, OR  
        // 3. User's email matches the invitation email (the invited user)
        if (!access.isPlatformAdmin &&
            !access.organizationIds.includes(invitation.organization_id) &&
            (!userEmail || userEmail.toLowerCase() !== invitation.email.toLowerCase())) {
            this.logger.warn({
                clerkUserId,
                userEmail,
                invitationEmail: invitation.email,
                invitationOrgId: invitation.organization_id
            }, 'User does not have access to this invitation');
            throw new Error('You do not have access to this invitation');
        }

        return invitation;
    }

    /**
     * Find invitation for acceptance - allows access if user email matches invitation email
     */
    async findInvitationForAcceptance(clerkUserId: string, id: string, userEmail: string) {
        this.logger.info({ id, userEmail }, 'InvitationService.findInvitationForAcceptance');

        const invitation = await this.repository.findInvitationById(id);
        if (!invitation) {
            throw new Error(`Invitation not found: ${id}`);
        }

        // Allow access if:
        // 1. User is platform admin, OR
        // 2. User is company admin for this organization, OR  
        // 3. User's email matches the invitation email (the invited user)
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.isPlatformAdmin &&
            !access.organizationIds.includes(invitation.organization_id) &&
            userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
            this.logger.warn({
                clerkUserId,
                userEmail,
                invitationEmail: invitation.email,
                invitationOrgId: invitation.organization_id
            }, 'User does not have access to this invitation');
            throw new Error('You do not have access to this invitation');
        }

        return invitation;
    }

    /**
     * Create a new invitation
     */
    async createInvitation(clerkUserId: string, invitationData: any) {
        // Authorize company admin or platform admin
        const access = await this.requireCompanyAdminOrPlatformAdmin(
            clerkUserId,
            invitationData.organization_id,
            invitationData.company_id
        );

        this.logger.info(
            {
                email: invitationData.email,
                organization_id: invitationData.organization_id,
                company_id: invitationData.company_id,
                role: invitationData.role,
            },
            'InvitationService.createInvitation'
        );

        // Validation
        if (!invitationData.email) {
            throw new Error('Email is required');
        }

        if (!invitationData.organization_id) {
            throw new Error('Organization ID is required');
        }

        if (!invitationData.role) {
            throw new Error('Role is required');
        }

        // Check for duplicate pending invitation
        const existing = await this.repository.findInvitations({
            email: invitationData.email.toLowerCase(),
            organization_id: invitationData.organization_id,
            company_id: invitationData.company_id || null,
            status: 'pending',
            page: 1,
            limit: 1,
        });

        if (existing.data.length > 0) {
            throw new Error('An invitation has already been sent to this email for this company');
        }

        const invitation = await this.repository.createInvitation({
            id: uuidv4(),
            organization_id: invitationData.organization_id,
            company_id: invitationData.company_id || null,
            email: invitationData.email.toLowerCase(),
            role: invitationData.role,
            status: 'pending',
            invited_by: access.identityUserId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('invitation.created', {
            invitation_id: invitation.id,
            organization_id: invitation.organization_id,
            company_id: invitation.company_id,
            email: invitation.email,
            role: invitation.role,
            invited_by: access.identityUserId,
        });

        this.logger.info({ id: invitation.id }, 'InvitationService.createInvitation - invitation created');
        return invitation;
    }

    /**
     * Update invitation
     */
    async updateInvitation(clerkUserId: string, id: string, updates: InvitationUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id, updates }, 'InvitationService.updateInvitation');

        await this.findInvitationById(clerkUserId, id, undefined);

        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const updated = await this.repository.updateInvitation(id, updateData);

        await this.eventPublisher.publish('invitation.updated', {
            invitation_id: id,
            changes: updateData,
        });

        this.logger.info({ id }, 'InvitationService.updateInvitation - invitation updated');
        return updated;
    }

    /**
     * Delete invitation (soft delete)
     */
    async deleteInvitation(clerkUserId: string, id: string) {
        this.logger.info({ id }, 'InvitationService.deleteInvitation');

        // findInvitationById checks authorization
        await this.findInvitationById(clerkUserId, id, undefined);
        await this.repository.deleteInvitation(id);

        await this.eventPublisher.publish('invitation.deleted', {
            invitation_id: id,
        });

        this.logger.info({ id }, 'InvitationService.deleteInvitation - invitation deleted');
    }

    /**
     * Accept an invitation and create membership
     */
    async acceptInvitation(invitationId: string, clerkUserId: string, userEmail: string) {
        this.logger.info({ invitationId, clerkUserId }, 'InvitationService.acceptInvitation');

        // Convert Clerk user ID to internal user ID
        const user = await this.userRepository.findUserByClerkId(clerkUserId);

        if (!user) {
            throw new Error('User not found');
        }

        const userId = user.id;

        // Fetch invitation without auth (user has the invitation link)
        const invitation = await this.repository.findInvitationById(invitationId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }

        if (invitation.status !== 'pending') {
            throw new Error('Invitation already used or expired');
        }

        if (new Date(invitation.expires_at) < new Date()) {
            throw new Error('Invitation has expired');
        }

        // Verify email matches
        if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
            throw new Error('Email does not match invitation');
        }

        // Update invitation status
        await this.repository.updateInvitation(invitationId, {
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Mark user's onboarding as completed (they're joining via invitation)
        await this.userRepository.updateUser(userId, {
            onboarding_status: 'completed',
            onboarding_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Create membership with the role from the invitation
        const membership = await this.membershipRepository.createMembership({
            id: uuidv4(),
            organization_id: invitation.organization_id,
            company_id: invitation.company_id,
            user_id: userId,
            role: invitation.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish events
        await this.eventPublisher.publish('invitation.accepted', {
            invitation_id: invitationId,
            user_id: userId,
            organization_id: invitation.organization_id,
            company_id: invitation.company_id,
            role: invitation.role,
        });

        await this.eventPublisher.publish('membership.created', {
            membership_id: membership.id,
            organization_id: membership.organization_id,
            company_id: membership.company_id,
            user_id: membership.user_id,
            role: membership.role,
        });

        // Final update to ensure onboarding status is correctly set to completed
        // This handles any potential race conditions or overrides
        await this.userRepository.updateUser(userId, {
            onboarding_status: 'completed',
            updated_at: new Date().toISOString(),
        });

        this.logger.info(
            { invitationId, userId, membershipId: membership.id, role: invitation.role },
            'InvitationService.acceptInvitation - completed, onboarding marked as completed, membership created'
        );
    }

    /**
     * Resend an invitation (extends expiration and re-sends email)
     */
    async resendInvitation(clerkUserId: string, invitationId: string): Promise<void> {
        const invitation = await this.findInvitationById(clerkUserId, invitationId, undefined);

        if (invitation.status !== 'pending') {
            throw new Error('Can only resend pending invitations');
        }

        // Extend expiration
        await this.repository.updateInvitation(invitationId, {
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Re-publish event to trigger email
        await this.eventPublisher.publish('invitation.created', {
            invitation_id: invitation.id,
            organization_id: invitation.organization_id,
            company_id: invitation.company_id,
            email: invitation.email,
            role: invitation.role,
            invited_by: invitation.invited_by,
        });

        this.logger.info({ invitationId }, 'InvitationService.resendInvitation - invitation resent');
    }
}
