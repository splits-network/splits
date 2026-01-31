/**
 * V2 Membership Service - Identity Service
 * Handles organization membership lifecycle and events
 */

import { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2 } from '../shared/events';
import { MembershipUpdate } from './types';
import { MembershipRepository } from './repository';
import { v4 as uuidv4 } from 'uuid';
import type { AccessContext } from '../shared/access';

export class MembershipServiceV2 {
    constructor(
        private repository: MembershipRepository,
        private eventPublisher: EventPublisherV2,
        private logger: Logger,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>
    ) { }

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            this.logger.warn({ clerkUserId }, 'MembershipService - unauthorized access attempt');
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    private async requireCompanyAdminOrPlatformAdmin(
        clerkUserId: string,
        organizationId: string
    ): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);

        // Platform admins can always proceed
        if (access.isPlatformAdmin) {
            return access;
        }

        // Check if user is company_admin for this organization
        if (!access.roles.includes('company_admin')) {
            this.logger.warn({ clerkUserId }, 'User does not have company_admin role');
            throw new Error('You must be a company admin');
        }

        if (!access.organizationIds.includes(organizationId)) {
            this.logger.warn({ clerkUserId, organizationId }, 'User is not a member of this organization');
            throw new Error('You must be a member of this organization');
        }

        return access;
    }

    /**
     * Find all memberships with pagination and filters
     */
    async findMemberships(clerkUserId: string, filters: any) {
        // Allow company admins to view memberships for their organization
        if (filters.organization_id) {
            await this.requireCompanyAdminOrPlatformAdmin(clerkUserId, filters.organization_id);
        } else {
            // If no organization filter, require platform admin
            await this.requirePlatformAdmin(clerkUserId);
        }

        this.logger.info({ filters }, 'MembershipService.findMemberships');
        const result = await this.repository.findMemberships(filters);
        return result;
    }

    /**
     * Find membership by ID
     */
    async findMembershipById(clerkUserId: string, id: string) {
        this.logger.info({ id }, 'MembershipService.findMembershipById');
        const membership = await this.repository.findMembershipById(id);
        if (!membership) {
            throw new Error(`Membership not found: ${id}`);
        }

        // Verify user has access to this membership's organization
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            // Check if user is company admin for this organization
            if (!access.organizationIds.includes(membership.organization_id)) {
                this.logger.warn({ clerkUserId, membershipOrgId: membership.organization_id }, 'User does not have access to this membership');
                throw new Error('You do not have access to this membership');
            }
        }

        return membership;
    }

    /**
     * Create a new membership
     */
    async createMembership(clerkUserId: string, membershipData: any) {
        //await this.requirePlatformAdmin(clerkUserId);
        this.logger.info(
            {
                organization_id: membershipData.organization_id,
                company_id: membershipData.company_id,
                user_id: membershipData.user_id,
                role: membershipData.role,
            },
            'MembershipService.createMembership'
        );

        if (!membershipData.organization_id) {
            throw new Error('Organization ID is required');
        }

        if (!membershipData.user_id) {
            throw new Error('User ID is required');
        }

        if (!membershipData.role) {
            throw new Error('Role is required');
        }

        const membership = await this.repository.createMembership({
            id: uuidv4(),
            organization_id: membershipData.organization_id,
            company_id: membershipData.company_id || null,
            user_id: membershipData.user_id,
            role: membershipData.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('membership.created', {
            membership_id: membership.id,
            organization_id: membership.organization_id,
            company_id: membership.company_id,
            user_id: membership.user_id,
            role: membership.role,
        });

        this.logger.info({ id: membership.id }, 'MembershipService.createMembership - membership created');
        return membership;
    }

    /**
     * Update membership
     */
    async updateMembership(clerkUserId: string, id: string, updates: MembershipUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id, updates }, 'MembershipService.updateMembership');

        await this.findMembershipById(clerkUserId, id);

        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const updated = await this.repository.updateMembership(id, updateData);

        await this.eventPublisher.publish('membership.updated', {
            membership_id: id,
            changes: updateData,
        });

        this.logger.info({ id }, 'MembershipService.updateMembership - membership updated');
        return updated;
    }

    /**
     * Delete membership (soft delete)
     */
    async deleteMembership(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id }, 'MembershipService.deleteMembership');

        await this.findMembershipById(clerkUserId, id);
        await this.repository.deleteMembership(id);

        await this.eventPublisher.publish('membership.deleted', {
            membership_id: id,
        });

        this.logger.info({ id }, 'MembershipService.deleteMembership - membership deleted');
    }
}
