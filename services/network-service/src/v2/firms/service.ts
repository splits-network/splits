/**
 * Firm Service - Business logic for firms, members, and invitations
 */

import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { FirmRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { FirmFilters, FirmUpdate, FirmMemberFilters, CreateFirmRequest, CreateFirmInvitationRequest, TransferOwnershipRequest } from './types';

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

        // Validate partner subscription before allowing firm creation
        const hasPartner = await this.repository.hasPartnerSubscription(clerkUserId);
        if (!hasPartner) {
            throw { statusCode: 403, message: 'An active Partner subscription is required to create a firm' };
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

        if (updates.admin_take_rate !== undefined) {
            if (updates.admin_take_rate < 0 || updates.admin_take_rate > 100) {
                throw { statusCode: 400, message: 'Admin take rate must be between 0 and 100' };
            }
            await this.requireFirmAdmin(id, clerkUserId);
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

    // ── Ownership Transfer ──

    async transferOwnership(
        firmId: string,
        data: TransferOwnershipRequest,
        clerkUserId: string
    ): Promise<any> {
        const firm = await this.repository.findFirm(firmId);
        if (!firm) {
            throw { statusCode: 404, message: 'Firm not found' };
        }

        // Verify caller is the current owner (resolve their internal user ID)
        const callerUserId = await this.repository.resolveInternalUserId(clerkUserId);
        if (firm.owner_user_id !== callerUserId) {
            throw { statusCode: 403, message: 'Only the firm owner can transfer ownership' };
        }

        // Verify new owner is an active member of the firm
        const newOwnerMember = await this.repository.findFirmMemberByRecruiterId(
            firmId,
            data.newOwnerRecruiterId
        );
        if (!newOwnerMember) {
            throw { statusCode: 400, message: 'New owner must be an active member of the firm' };
        }
        if (newOwnerMember.role === 'owner') {
            throw { statusCode: 400, message: 'This member is already the owner' };
        }

        // Verify new owner has partner subscription
        const newOwnerUserId = await this.repository.getRecruiterUserId(data.newOwnerRecruiterId);
        if (!newOwnerUserId) {
            throw { statusCode: 400, message: 'Could not resolve new owner user' };
        }

        const hasPartner = await this.repository.hasPartnerSubscriptionByUserId(newOwnerUserId);
        if (!hasPartner) {
            throw { statusCode: 403, message: 'New owner must have an active Partner subscription' };
        }

        // Find current owner's firm_member record
        const currentOwnerMember = await this.repository.findOwnerMember(firmId);
        if (!currentOwnerMember) {
            throw { statusCode: 500, message: 'Could not find current owner member record' };
        }

        const updatedFirm = await this.repository.transferOwnership(
            firmId,
            newOwnerUserId,
            newOwnerMember.id,
            currentOwnerMember.id
        );

        await this.eventPublisher.publish('firm.ownership_transferred', {
            firmId,
            previousOwnerUserId: callerUserId,
            newOwnerUserId,
            newOwnerRecruiterId: data.newOwnerRecruiterId,
        });

        return updatedFirm;
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

    // ── My Firm ──

    async getMyFirm(clerkUserId: string): Promise<any | null> {
        const internalUserId = await this.repository.resolveInternalUserId(clerkUserId);
        const recruiter = await this.repository.getRecruiterByUserId(internalUserId);
        if (!recruiter) return null;
        return this.repository.findFirmByRecruiterId(recruiter.id);
    }

    // ── Private helpers ──

    private async requireFirmAdmin(firmId: string, clerkUserId: string): Promise<void> {
        const internalUserId = await this.repository.resolveInternalUserId(clerkUserId);
        const recruiter = await this.repository.getRecruiterByUserId(internalUserId);
        if (!recruiter) {
            throw { statusCode: 403, message: 'Firm admin access required' };
        }

        const member = await this.repository.findFirmMemberByRecruiterId(firmId, recruiter.id);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw { statusCode: 403, message: 'Only firm owners and admins can update the take rate' };
        }
    }

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
