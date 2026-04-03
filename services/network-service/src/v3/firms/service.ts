/**
 * Firms V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver, EntitlementChecker } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { FirmRepository } from './repository.js';
import {
  FirmListParams, FirmUpdate, CreateFirmInput, FirmMemberListParams,
  CreateFirmInvitationInput, TransferOwnershipInput,
  VALID_PLACEMENT_TYPES, VALID_TEAM_SIZE_RANGES,
} from './types.js';

export class FirmService {
  private accessResolver: AccessContextResolver;
  private entitlementChecker: EntitlementChecker;

  constructor(
    private repository: FirmRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.entitlementChecker = new EntitlementChecker(supabase);
  }

  async getAll(params: FirmListParams, clerkUserId: string) {
    const scopeFilters = await this.buildScopeFilters(clerkUserId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundError('Firm', id);
    return data;
  }

  async getBySlug(slug: string) {
    const firm = await this.repository.findBySlug(slug);
    if (!firm) throw new NotFoundError('Firm', slug);
    return firm;
  }

  async getMyFirm(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) return null;
    const recruiter = await this.repository.getRecruiterByUserId(ctx.identityUserId);
    if (!recruiter) return null;
    return this.repository.findFirmByRecruiterId(recruiter.id);
  }

  async getMyFirms(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) return [];
    const recruiter = await this.repository.getRecruiterByUserId(ctx.identityUserId);
    if (!recruiter) return [];
    return this.repository.findFirmsByRecruiterId(recruiter.id);
  }

  async create(input: CreateFirmInput, clerkUserId: string) {
    if (!input.name?.trim()) throw new BadRequestError('Firm name is required');

    const canCreate = await this.entitlementChecker.hasEntitlementByClerkId(clerkUserId, 'firm_creation');
    if (!canCreate) throw new ForbiddenError('An active Partner subscription is required to create a firm');

    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) throw new BadRequestError('User not found');

    const firm = await this.repository.create({ name: input.name.trim() }, ctx.identityUserId, ctx.recruiterId || undefined);
    await this.eventPublisher?.publish('firm.created', { firmId: firm.id, name: firm.name, ownerUserId: clerkUserId }, 'network-service');
    return firm;
  }

  async update(id: string, updates: FirmUpdate, clerkUserId: string) {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Firm', id);
    if (updates.status) this.validateStatusTransition(current.status, updates.status);

    if (updates.admin_take_rate !== undefined) {
      if (updates.admin_take_rate < 0 || updates.admin_take_rate > 100) throw new BadRequestError('Admin take rate must be between 0 and 100');
      await this.requireFirmAdmin(id, clerkUserId);
    }
    if (updates.slug !== undefined && updates.slug) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updates.slug)) throw new BadRequestError('Slug must be lowercase alphanumeric with hyphens only');
      const taken = await this.repository.isSlugTaken(updates.slug, id);
      if (taken) throw new BadRequestError('This slug is already taken');
    }
    if (updates.tagline && updates.tagline.length > 160) throw new BadRequestError('Tagline must be 160 characters or fewer');
    if (updates.placement_types) {
      const invalid = updates.placement_types.filter(t => !(VALID_PLACEMENT_TYPES as readonly string[]).includes(t));
      if (invalid.length > 0) throw new BadRequestError(`Invalid placement types: ${invalid.join(', ')}`);
    }
    if (updates.team_size_range && !(VALID_TEAM_SIZE_RANGES as readonly string[]).includes(updates.team_size_range)) {
      throw new BadRequestError(`Invalid team size range: ${updates.team_size_range}`);
    }
    if (updates.headquarters_country && updates.headquarters_country.length !== 2) {
      throw new BadRequestError('Country must be a 2-letter ISO 3166-1 alpha-2 code');
    }
    if (updates.founded_year !== undefined && updates.founded_year !== null) {
      const currentYear = new Date().getFullYear();
      if (updates.founded_year < 1900 || updates.founded_year > currentYear) {
        throw new BadRequestError(`Founded year must be between 1900 and ${currentYear}`);
      }
    }

    const firm = await this.repository.update(id, updates);
    await this.eventPublisher?.publish('firm.updated', { firmId: id, updates: Object.keys(updates) }, 'network-service');
    return firm;
  }

  async delete(id: string, clerkUserId: string) {
    const firm = await this.repository.findById(id);
    if (!firm) throw new NotFoundError('Firm', id);
    await this.repository.delete(id);
    await this.eventPublisher?.publish('firm.deleted', { firmId: id }, 'network-service');
  }

  // --- Members ---

  async getMembers(firmId: string, params: FirmMemberListParams) {
    const { data, total } = await this.repository.findMembers(firmId, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async removeMember(firmId: string, memberId: string, clerkUserId: string) {
    const member = await this.repository.findMember(memberId);
    if (!member) throw new NotFoundError('FirmMember', memberId);
    if (member.role === 'owner') throw new BadRequestError('Cannot remove the firm owner');
    await this.repository.removeMember(firmId, memberId);
    await this.eventPublisher?.publish('firm.member.removed', { firmId, memberId, removedBy: clerkUserId }, 'network-service');
  }

  async transferOwnership(firmId: string, input: TransferOwnershipInput, clerkUserId: string) {
    const firm = await this.repository.findById(firmId);
    if (!firm) throw new NotFoundError('Firm', firmId);
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (firm.owner_user_id !== ctx.identityUserId) throw new ForbiddenError('Only the firm owner can transfer ownership');

    const newOwnerMember = await this.repository.findMemberByRecruiterId(firmId, input.newOwnerRecruiterId);
    if (!newOwnerMember) throw new BadRequestError('New owner must be an active member of the firm');
    if (newOwnerMember.role === 'owner') throw new BadRequestError('This member is already the owner');

    const newOwnerUserId = await this.repository.getRecruiterUserId(input.newOwnerRecruiterId);
    if (!newOwnerUserId) throw new BadRequestError('Could not resolve new owner user');
    const hasPartner = await this.entitlementChecker.hasEntitlement(newOwnerUserId, 'firm_creation');
    if (!hasPartner) throw new ForbiddenError('New owner must have an active Partner subscription');

    const currentOwnerMember = await this.repository.findOwnerMember(firmId);
    if (!currentOwnerMember) throw new BadRequestError('Could not find current owner member record');

    const updated = await this.repository.transferOwnership(firmId, newOwnerUserId, newOwnerMember.id, currentOwnerMember.id);
    await this.eventPublisher?.publish('firm.ownership_transferred', {
      firmId, previousOwnerUserId: ctx.identityUserId, newOwnerUserId, newOwnerRecruiterId: input.newOwnerRecruiterId,
    }, 'network-service');
    return updated;
  }

  // --- Invitations ---

  async listInvitations(firmId: string) {
    return this.repository.listInvitations(firmId);
  }

  async createInvitation(firmId: string, input: CreateFirmInvitationInput, clerkUserId: string) {
    if (!input.email?.trim()) throw new BadRequestError('Email is required');
    if (!['admin', 'member', 'collaborator'].includes(input.role)) throw new BadRequestError('Role must be admin, member, or collaborator');

    const ctx = await this.accessResolver.resolve(clerkUserId);
    const invitation = await this.repository.createInvitation(firmId, input.email.trim(), input.role, ctx.identityUserId || '');
    await this.eventPublisher?.publish('firm.invitation.created', {
      firmId, invitationId: invitation.id, email: input.email, role: input.role, invitedBy: clerkUserId,
    }, 'network-service');
    return invitation;
  }

  async cancelInvitation(firmId: string, invitationId: string, clerkUserId: string) {
    await this.repository.cancelInvitation(firmId, invitationId);
    await this.eventPublisher?.publish('firm.invitation.cancelled', { firmId, invitationId, cancelledBy: clerkUserId }, 'network-service');
  }

  async resendInvitation(firmId: string, invitationId: string, clerkUserId: string) {
    const invitation = await this.repository.resendInvitation(firmId, invitationId);
    await this.eventPublisher?.publish('firm.invitation.created', {
      firmId, invitationId: invitation.id, email: invitation.email, role: invitation.role, invitedBy: clerkUserId,
    }, 'network-service');
    return invitation;
  }

  async getInvitationPreview(token: string) {
    const invitation = await this.repository.findInvitationByToken(token);
    if (!invitation) throw new NotFoundError('FirmInvitation', token);
    return {
      id: invitation.id, organization_name: invitation.firm?.name || null,
      organization_slug: invitation.firm?.slug || null, role: invitation.role,
      status: invitation.status, expires_at: invitation.expires_at,
    };
  }

  async acceptInvitation(token: string, clerkUserId: string, userEmail: string) {
    const invitation = await this.repository.findInvitationByToken(token);
    if (!invitation) throw new NotFoundError('FirmInvitation', token);
    if (invitation.status !== 'pending') throw new BadRequestError('Invitation already used or revoked');
    if (new Date(invitation.expires_at) < new Date()) throw new BadRequestError('Invitation has expired');
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) throw new ForbiddenError('Email does not match invitation');

    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) throw new BadRequestError('User not found');
    let recruiter = await this.repository.getRecruiterByUserId(ctx.identityUserId);

    // Auto-create a minimal recruiter profile for new users accepting a firm invitation
    if (!recruiter) {
      const { data: user } = await this.supabase.from('users').select('id, name, email')
        .eq('id', ctx.identityUserId).single();
      if (!user) throw new BadRequestError('User not found');

      const now = new Date().toISOString();
      const slug = user.name
        ? await this.generateRecruiterSlug(user.name)
        : undefined;

      const { data: newRecruiter, error: createError } = await this.supabase.from('recruiters').insert({
        user_id: user.id, name: user.name || null, email: user.email || userEmail,
        status: 'active', ...(slug ? { slug } : {}), created_at: now, updated_at: now,
      }).select('id, user_id').single();
      if (createError) throw new BadRequestError(`Failed to create recruiter profile: ${createError.message}`);

      // Create user_roles entry so user is recognized as a recruiter
      await this.supabase.from('user_roles').insert({
        user_id: user.id, role_name: 'recruiter', role_entity_id: newRecruiter.id,
        created_at: now, updated_at: now,
      });

      await this.eventPublisher?.publish('recruiter.created', {
        recruiterId: newRecruiter.id, userId: user.id, status: 'active',
        fromFirmInvitation: true,
      }, 'network-service');

      recruiter = newRecruiter;
    }

    const existingMember = await this.repository.findMemberByRecruiterId(invitation.firm_id, recruiter.id);
    if (existingMember) throw new BadRequestError('You are already a member of this firm');

    await this.repository.createMemberFromInvitation(invitation.firm_id, recruiter.id, invitation.role);
    await this.repository.acceptInvitation(invitation.id);

    await this.eventPublisher?.publish('firm.invitation.accepted', {
      firmId: invitation.firm_id, invitationId: invitation.id, recruiterId: recruiter.id,
      role: invitation.role, acceptedBy: clerkUserId,
    }, 'network-service');

    // Check if user still needs onboarding
    const { data: userRecord } = await this.supabase.from('users').select('onboarding_status')
      .eq('id', ctx.identityUserId).single();
    const needsOnboarding = userRecord?.onboarding_status !== 'completed';

    return { needsOnboarding };
  }

  // --- Public ---

  async getPublicFirms(params: FirmListParams) {
    const { data, total } = await this.repository.findPublicFirms(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 24, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getPublicFirmBySlug(slug: string) {
    const firm = await this.repository.findPublicFirmBySlug(slug);
    if (!firm) throw new NotFoundError('Firm', slug);
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

  async getPublicFirmMembers(slug: string) {
    const firm = await this.repository.findPublicFirmBySlug(slug);
    if (!firm) throw new NotFoundError('Firm', slug);
    if (!firm.show_member_count) throw new ForbiddenError('Member list is not public');
    return this.repository.findPublicFirmMembers(firm.id);
  }

  // --- Helpers ---

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) {
      const { data: memberFirmIds } = await this.supabase.from('firm_members').select('firm_id')
        .eq('recruiter_id', ctx.recruiterId).eq('status', 'active');
      const firmIds = (memberFirmIds || []).map((m: any) => m.firm_id);
      return firmIds.length > 0 ? { firm_ids: firmIds } : null;
    }
    if (ctx.organizationIds.length > 0) return { billing_organization_ids: ctx.organizationIds };
    return null;
  }

  private async requireFirmAdmin(firmId: string, clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.identityUserId) throw new ForbiddenError('Firm admin access required');
    const recruiter = await this.repository.getRecruiterByUserId(ctx.identityUserId);
    if (!recruiter) throw new ForbiddenError('Firm admin access required');
    const member = await this.repository.findMemberByRecruiterId(firmId, recruiter.id);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new ForbiddenError('Only firm owners and admins can update the take rate');
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const valid: Record<string, string[]> = { active: ['suspended'], suspended: ['active'] };
    if (!(valid[currentStatus] || []).includes(newStatus)) {
      throw new BadRequestError(`Cannot transition firm from ${currentStatus} to ${newStatus}`);
    }
  }

  private async generateRecruiterSlug(name: string): Promise<string | undefined> {
    const base = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!base) return undefined;
    let slug = base;
    let counter = 2;
    while (true) {
      const { data } = await this.supabase.from('recruiters').select('id').eq('slug', slug).maybeSingle();
      if (!data) break;
      slug = `${base}-${counter}`;
      counter++;
    }
    return slug;
  }
}
