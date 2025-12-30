/**
 * V2 Membership Service - Identity Service
 * Handles organization membership lifecycle and events
 */

import { Logger } from '@splits-network/shared-logging';
import { RepositoryV2 } from '../repository';
import { EventPublisherV2 } from '../shared/events';
import { MembershipUpdate } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MembershipServiceV2 {
    constructor(
        private repository: RepositoryV2,
        private eventPublisher: EventPublisherV2,
        private logger: Logger
    ) {}

    /**
     * Find all memberships with pagination and filters
     */
    async findMemberships(filters: any) {
        this.logger.info({ filters }, 'MembershipService.findMemberships');
        const result = await this.repository.findMemberships(filters);
        return result;
    }

    /**
     * Find membership by ID
     */
    async findMembershipById(id: string) {
        this.logger.info({ id }, 'MembershipService.findMembershipById');
        const membership = await this.repository.findMembershipById(id);
        if (!membership) {
            throw new Error(`Membership not found: ${id}`);
        }
        return membership;
    }

    /**
     * Create a new membership
     */
    async createMembership(membershipData: any) {
        this.logger.info(
            {
                organization_id: membershipData.organization_id,
                user_id: membershipData.user_id,
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
            user_id: membershipData.user_id,
            role: membershipData.role,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('membership.created', {
            membership_id: membership.id,
            organization_id: membership.organization_id,
            user_id: membership.user_id,
            role: membership.role,
        });

        this.logger.info({ id: membership.id }, 'MembershipService.createMembership - membership created');
        return membership;
    }

    /**
     * Update membership
     */
    async updateMembership(id: string, updates: MembershipUpdate) {
        this.logger.info({ id, updates }, 'MembershipService.updateMembership');

        await this.findMembershipById(id);

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
    async deleteMembership(id: string) {
        this.logger.info({ id }, 'MembershipService.deleteMembership');

        await this.findMembershipById(id);
        await this.repository.deleteMembership(id);

        await this.eventPublisher.publish('membership.deleted', {
            membership_id: id,
        });

        this.logger.info({ id }, 'MembershipService.deleteMembership - membership deleted');
    }
}
