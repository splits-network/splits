/**
 * V2 Invitation Service - Identity Service
 * Handles invitation lifecycle and events
 */

import { Logger } from '@splits-network/shared-logging';
import { RepositoryV2 } from '../repository';
import { EventPublisherV2 } from '../shared/events';
import { InvitationUpdate } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class InvitationServiceV2 {
    constructor(
        private repository: RepositoryV2,
        private eventPublisher: EventPublisherV2,
        private logger: Logger
    ) {}

    /**
     * Find all invitations with pagination and filters
     */
    async findInvitations(filters: any) {
        this.logger.info({ filters }, 'InvitationService.findInvitations');
        const result = await this.repository.findInvitations(filters);
        return result;
    }

    /**
     * Find invitation by ID
     */
    async findInvitationById(id: string) {
        this.logger.info({ id }, 'InvitationService.findInvitationById');
        const invitation = await this.repository.findInvitationById(id);
        if (!invitation) {
            throw new Error(`Invitation not found: ${id}`);
        }
        return invitation;
    }

    /**
     * Create a new invitation
     */
    async createInvitation(invitationData: any) {
        this.logger.info(
            {
                email: invitationData.email,
                organization_id: invitationData.organization_id,
            },
            'InvitationService.createInvitation'
        );

        if (!invitationData.email) {
            throw new Error('Email is required');
        }

        if (!invitationData.organization_id) {
            throw new Error('Organization ID is required');
        }

        if (!invitationData.role) {
            throw new Error('Role is required');
        }

        const invitation = await this.repository.createInvitation({
            id: uuidv4(),
            organization_id: invitationData.organization_id,
            email: invitationData.email,
            role: invitationData.role,
            status: 'pending',
            invited_by: invitationData.invited_by || null,
            token: uuidv4(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('invitation.created', {
            invitation_id: invitation.id,
            organization_id: invitation.organization_id,
            email: invitation.email,
            role: invitation.role,
        });

        this.logger.info({ id: invitation.id }, 'InvitationService.createInvitation - invitation created');
        return invitation;
    }

    /**
     * Update invitation
     */
    async updateInvitation(id: string, updates: InvitationUpdate) {
        this.logger.info({ id, updates }, 'InvitationService.updateInvitation');

        await this.findInvitationById(id);

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
    async deleteInvitation(id: string) {
        this.logger.info({ id }, 'InvitationService.deleteInvitation');

        await this.findInvitationById(id);
        await this.repository.deleteInvitation(id);

        await this.eventPublisher.publish('invitation.deleted', {
            invitation_id: id,
        });

        this.logger.info({ id }, 'InvitationService.deleteInvitation - invitation deleted');
    }
}
