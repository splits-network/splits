/**
 * Firm Service - Business logic for firms, members, and invitations
 */

import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { FirmRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { FirmFilters, FirmUpdate, FirmMemberFilters, CreateFirmRequest, CreateFirmInvitationRequest } from './types';

export class FirmServiceV2 {
    constructor(
        private repository: FirmRepository,
        private eventPublisher: IEventPublisher
    ) {}

    // ── Firms ──

    async getFirms(
        clerkUserId: string,
        filters: FirmFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findFirms(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getFirm(id: string): Promise<any> {
        const firm = await this.repository.findFirm(id);
        if (!firm) {
            throw { statusCode: 404, message: 'Firm not found' };
        }
        return firm;
    }

    async createFirm(
        data: CreateFirmRequest,
        clerkUserId: string
    ): Promise<any> {
        if (!data.name || !data.name.trim()) {
            throw { statusCode: 400, message: 'Firm name is required' };
        }

        const firm = await this.repository.createFirm(
            { name: data.name.trim() },
            clerkUserId
        );

        await this.eventPublisher.publish('firm.created', {
            firmId: firm.id,
            name: firm.name,
            ownerUserId: clerkUserId,
        });

        return firm;
    }

    async updateFirm(
        id: string,
        updates: FirmUpdate,
        clerkUserId: string
    ): Promise<any> {
        const current = await this.repository.findFirm(id);
        if (!current) {
            throw { statusCode: 404, message: 'Firm not found' };
        }

        if (updates.status) {
            this.validateStatusTransition(current.status, updates.status);
        }

        const firm = await this.repository.updateFirm(id, updates);

        await this.eventPublisher.publish('firm.updated', {
            firmId: id,
            updates: Object.keys(updates),
        });

        return firm;
    }

    async deleteFirm(id: string, clerkUserId: string): Promise<void> {
        const firm = await this.repository.findFirm(id);
        if (!firm) {
            throw { statusCode: 404, message: 'Firm not found' };
        }

        await this.repository.deleteFirm(id);

        await this.eventPublisher.publish('firm.deleted', {
            firmId: id,
        });
    }

    // ── Members ──

    async getFirmMembers(
        firmId: string,
        filters: FirmMemberFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findFirmMembers(firmId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 50
        );
    }

    async removeFirmMember(
        firmId: string,
        memberId: string,
        clerkUserId: string
    ): Promise<void> {
        const member = await this.repository.findFirmMember(memberId);
        if (!member) {
            throw { statusCode: 404, message: 'Firm member not found' };
        }
        if (member.role === 'owner') {
            throw { statusCode: 400, message: 'Cannot remove the firm owner' };
        }

        await this.repository.removeFirmMember(firmId, memberId);

        await this.eventPublisher.publish('firm.member.removed', {
            firmId,
            memberId,
            removedBy: clerkUserId,
        });
    }

    // ── Invitations ──

    async createFirmInvitation(
        firmId: string,
        data: CreateFirmInvitationRequest,
        clerkUserId: string
    ): Promise<any> {
        if (!data.email || !data.email.trim()) {
            throw { statusCode: 400, message: 'Email is required' };
        }
        if (!['admin', 'member', 'collaborator'].includes(data.role)) {
            throw { statusCode: 400, message: 'Role must be admin, member, or collaborator' };
        }

        const invitation = await this.repository.createFirmInvitation(
            firmId,
            { email: data.email.trim(), role: data.role },
            clerkUserId
        );

        await this.eventPublisher.publish('firm.invitation.created', {
            firmId,
            invitationId: invitation.id,
            email: data.email,
            role: data.role,
            invitedBy: clerkUserId,
        });

        return invitation;
    }

    // ── Private helpers ──

    private validateStatusTransition(currentStatus: string, newStatus: string): void {
        const validTransitions: Record<string, string[]> = {
            active: ['suspended'],
            suspended: ['active'],
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw {
                statusCode: 400,
                message: `Cannot transition firm from ${currentStatus} to ${newStatus}`,
            };
        }
    }
}
