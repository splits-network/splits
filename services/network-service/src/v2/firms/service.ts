/**
 * Firm Service - Business logic for firms, members, and invitations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { EventPublisherV2, IEventPublisher } from '../shared/events.js';
import { EntitlementChecker } from '@splits-network/shared-access-context';
import { FirmRepository } from './repository.js';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination.js';
import { FirmFilters, FirmUpdate, FirmMemberFilters, CreateFirmRequest, CreateFirmInvitationRequest, TransferOwnershipRequest, PublicFirmFilters, VALID_PLACEMENT_TYPES, VALID_TEAM_SIZE_RANGES } from './types.js';

export class FirmServiceV2 {
    private entitlementChecker: EntitlementChecker;

    constructor(
        private repository: FirmRepository,
        private eventPublisher: IEventPublisher,
        supabase?: SupabaseClient
    ) {
        if (supabase) {
            this.entitlementChecker = new EntitlementChecker(supabase);
        } else {
            // Fallback: create from repository's connection (for backwards compatibility)
            this.entitlementChecker = new EntitlementChecker(null as any);
        }
    }

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

    async getFirmBySlug(slug: string): Promise<any> {
        const firm = await this.repository.findFirmBySlug(slug);
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

        // Validate entitlement before allowing firm creation
        const canCreate = await this.entitlementChecker.hasEntitlementByClerkId(clerkUserId, 'firm_creation');
        if (!canCreate) {
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

        // Validate profile fields
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
        if (updates.tagline && updates.tagline.length > 160) {
            throw { statusCode: 400, message: 'Tagline must be 160 characters or fewer' };
        }
        if (updates.placement_types) {
            const invalid = updates.placement_types.filter(
                t => !(VALID_PLACEMENT_TYPES as readonly string[]).includes(t)
            );
            if (invalid.length > 0) {
                throw { statusCode: 400, message: `Invalid placement types: ${invalid.join(', ')}` };
            }
        }
        if (updates.team_size_range) {
            if (!(VALID_TEAM_SIZE_RANGES as readonly string[]).includes(updates.team_size_range)) {
                throw { statusCode: 400, message: `Invalid team size range: ${updates.team_size_range}` };
            }
        }
        if (updates.headquarters_country && updates.headquarters_country.length !== 2) {
            throw { statusCode: 400, message: 'Country must be a 2-letter ISO 3166-1 alpha-2 code' };
        }
        if (updates.founded_year !== undefined && updates.founded_year !== null) {
            const currentYear = new Date().getFullYear();
            if (updates.founded_year < 1900 || updates.founded_year > currentYear) {
                throw { statusCode: 400, message: `Founded year must be between 1900 and ${currentYear}` };
            }
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

        const hasPartner = await this.entitlementChecker.hasEntitlement(newOwnerUserId, 'firm_creation');
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

    async listFirmInvitations(firmId: string): Promise<any[]> {
        return this.repository.listFirmInvitations(firmId);
    }

    async cancelFirmInvitation(
        firmId: string,
        invitationId: string,
        clerkUserId: string
    ): Promise<void> {
        await this.repository.cancelFirmInvitation(firmId, invitationId);

        await this.eventPublisher.publish('firm.invitation.cancelled', {
            firmId,
            invitationId,
            cancelledBy: clerkUserId,
        });
    }

    async resendFirmInvitation(
        firmId: string,
        invitationId: string,
        clerkUserId: string
    ): Promise<any> {
        const invitation = await this.repository.resendFirmInvitation(firmId, invitationId);

        await this.eventPublisher.publish('firm.invitation.created', {
            firmId,
            invitationId: invitation.id,
            email: invitation.email,
            role: invitation.role,
            invitedBy: clerkUserId,
        });

        return invitation;
    }

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

    // ── Firm Invitation Acceptance (public + authenticated) ──

    async getFirmInvitationPreview(token: string): Promise<any> {
        const invitation = await this.repository.findFirmInvitationByToken(token);
        if (!invitation) {
            throw { statusCode: 404, message: 'Invitation not found' };
        }

        return {
            id: invitation.id,
            organization_name: invitation.firm?.name || null,
            organization_slug: invitation.firm?.slug || null,
            role: invitation.role,
            status: invitation.status,
            expires_at: invitation.expires_at,
        };
    }

    async acceptFirmInvitation(
        token: string,
        clerkUserId: string,
        userEmail: string
    ): Promise<void> {
        const invitation = await this.repository.findFirmInvitationByToken(token);
        if (!invitation) {
            throw { statusCode: 404, message: 'Invitation not found' };
        }

        if (invitation.status !== 'pending') {
            throw { statusCode: 400, message: 'Invitation already used or revoked' };
        }

        if (new Date(invitation.expires_at) < new Date()) {
            throw { statusCode: 400, message: 'Invitation has expired' };
        }

        if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
            throw { statusCode: 403, message: 'Email does not match invitation' };
        }

        // Resolve clerk user to internal user, then to recruiter
        const internalUserId = await this.repository.resolveInternalUserId(clerkUserId);
        const recruiter = await this.repository.getRecruiterByUserId(internalUserId);
        if (!recruiter) {
            throw { statusCode: 400, message: 'You must have a recruiter profile to join a firm' };
        }

        // Check if already a member
        const existingMember = await this.repository.findFirmMemberByRecruiterId(
            invitation.firm_id,
            recruiter.id
        );
        if (existingMember) {
            throw { statusCode: 409, message: 'You are already a member of this firm' };
        }

        // Create firm member and mark invitation accepted
        await this.repository.createFirmMemberFromInvitation(
            invitation.firm_id,
            recruiter.id,
            invitation.role
        );

        await this.repository.acceptFirmInvitation(invitation.id);

        await this.eventPublisher.publish('firm.invitation.accepted', {
            firmId: invitation.firm_id,
            invitationId: invitation.id,
            recruiterId: recruiter.id,
            role: invitation.role,
            acceptedBy: clerkUserId,
        });
    }

    // ── Public (unauthenticated) ──

    async getPublicFirms(filters: PublicFirmFilters): Promise<PaginationResponse<any>> {
        const result = await this.repository.findPublicFirms(filters);
        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 24
        );
    }

    async getPublicFirmBySlug(slug: string): Promise<any> {
        const firm = await this.repository.findPublicFirmBySlug(slug);
        if (!firm) {
            throw { statusCode: 404, message: 'Firm not found' };
        }
        return firm;
    }

    async getPublicFirmProfile(slug: string) {
        const firm = await this.repository.findPublicFirmBySlug(slug);
        if (!firm) return null;

        const [statsResult, placementsResult, ownerResult] = await Promise.allSettled([
            this.repository.getFirmPlacementStats(firm.id),
            this.repository.getFirmRecentPlacements(firm.id),
            this.repository.getFirmOwnerUserId(firm.id),
        ]);

        return {
            firm,
            placement_stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
            recent_placements: placementsResult.status === 'fulfilled' ? placementsResult.value : [],
            contact_user_id: ownerResult.status === 'fulfilled' ? ownerResult.value : null,
        };
    }

    async getPublicFirmMembers(slug: string): Promise<any[]> {
        const firm = await this.repository.findPublicFirmBySlug(slug);
        if (!firm) {
            throw { statusCode: 404, message: 'Firm not found' };
        }
        if (!firm.show_member_count) {
            throw { statusCode: 403, message: 'Member list is not public' };
        }
        return this.repository.findPublicFirmMembers(firm.id);
    }

    // ── My Firm ──

    async getMyFirm(clerkUserId: string): Promise<any | null> {
        const internalUserId = await this.repository.resolveInternalUserId(clerkUserId);
        const recruiter = await this.repository.getRecruiterByUserId(internalUserId);
        if (!recruiter) return null;
        return this.repository.findFirmByRecruiterId(recruiter.id);
    }

    async getMyFirms(clerkUserId: string): Promise<any[]> {
        const internalUserId = await this.repository.resolveInternalUserId(clerkUserId);
        const recruiter = await this.repository.getRecruiterByUserId(internalUserId);
        if (!recruiter) return [];
        return this.repository.findFirmsByRecruiterId(recruiter.id);
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
