/**
 * Invitations V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { InvitationRepository } from './repository';
import { MembershipRepository } from '../memberships/repository';
import { UserRepository } from '../users/repository';
import { CreateInvitationInput, UpdateInvitationInput, InvitationListParams } from './types';

export class InvitationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: InvitationRepository,
    private userRepository: UserRepository,
    private membershipRepository: MembershipRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: InvitationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      if (params.organization_id) {
        this.requireCompanyAdminOrPlatformAdmin(context, params.organization_id);
      } else {
        throw new ForbiddenError('Platform admin permissions required');
      }
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string, userEmail?: string) {
    const invitation = await this.repository.findById(id);
    if (!invitation) throw new NotFoundError('Invitation', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin &&
        !context.organizationIds.includes(invitation.organization_id) &&
        (!userEmail || userEmail.toLowerCase() !== invitation.email.toLowerCase())) {
      throw new ForbiddenError('You do not have access to this invitation');
    }
    return invitation;
  }

  async getPreview(id: string) {
    const invitation = await this.repository.findById(id);
    if (!invitation) throw new NotFoundError('Invitation', id);

    return {
      id: invitation.id,
      organization_name:
        invitation.organizations?.display_name ||
        invitation.organizations?.name ||
        invitation.organizations?.slug ||
        null,
      organization_slug: invitation.organizations?.slug || null,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
    };
  }

  async create(input: CreateInvitationInput, clerkUserId: string) {
    if (!input.email?.trim()) throw new BadRequestError('Email is required');
    if (!input.organization_id) throw new BadRequestError('Organization ID is required');
    if (!input.role?.trim()) throw new BadRequestError('Role is required');

    const context = await this.accessResolver.resolve(clerkUserId);
    this.requireCompanyAdminOrPlatformAdmin(context, input.organization_id);

    // Check duplicate pending invitation
    const existing = await this.repository.findAll({
      email: input.email.toLowerCase(),
      organization_id: input.organization_id,
      company_id: input.company_id || undefined,
      status: 'pending',
      page: 1,
      limit: 1,
    });

    if (existing.data.length > 0) {
      throw new BadRequestError('An invitation has already been sent to this email for this company');
    }

    const now = new Date().toISOString();
    const created = await this.repository.create({
      organization_id: input.organization_id,
      company_id: input.company_id || null,
      email: input.email.toLowerCase(),
      role: input.role,
      status: 'pending',
      invited_by: context.identityUserId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: now,
      updated_at: now,
    });

    await this.eventPublisher?.publish('invitation.created', {
      invitation_id: created.id,
      organization_id: created.organization_id,
      company_id: created.company_id,
      email: created.email,
      role: created.role,
      invited_by: context.identityUserId,
    }, 'identity-service');

    return created;
  }

  async update(id: string, input: UpdateInvitationInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Platform admin permissions required');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Invitation', id);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Invitation', id);

    await this.eventPublisher?.publish('invitation.updated', {
      invitation_id: id,
      changes: input,
    }, 'identity-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const invitation = await this.repository.findById(id);
    if (!invitation) throw new NotFoundError('Invitation', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin &&
        !context.organizationIds.includes(invitation.organization_id)) {
      throw new ForbiddenError('You do not have access to this invitation');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('invitation.deleted', {
      invitation_id: id,
    }, 'identity-service');
  }

  async accept(invitationId: string, clerkUserId: string, userEmail: string) {
    const user = await this.userRepository.findByClerkId(clerkUserId);
    if (!user) throw new NotFoundError('User', clerkUserId);

    const invitation = await this.repository.findById(invitationId);
    if (!invitation) throw new NotFoundError('Invitation', invitationId);

    if (invitation.status !== 'pending') {
      throw new BadRequestError('Invitation already used or expired');
    }
    if (new Date(invitation.expires_at) < new Date()) {
      throw new BadRequestError('Invitation has expired');
    }
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new BadRequestError('Email does not match invitation');
    }

    await this.repository.update(invitationId, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });

    await this.userRepository.update(user.id, {
      onboarding_status: 'completed',
      onboarding_completed_at: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const membership = await this.membershipRepository.create({
      user_id: user.id,
      role_name: invitation.role,
      organization_id: invitation.organization_id,
      company_id: invitation.company_id,
      created_at: now,
      updated_at: now,
    });

    await this.eventPublisher?.publish('invitation.accepted', {
      invitation_id: invitationId,
      user_id: user.id,
      organization_id: invitation.organization_id,
      company_id: invitation.company_id,
      role: invitation.role,
    }, 'identity-service');

    await this.eventPublisher?.publish('membership.created', {
      membership_id: membership.id,
      user_id: user.id,
      role_name: invitation.role,
      organization_id: invitation.organization_id,
      company_id: invitation.company_id,
    }, 'identity-service');
  }

  async resend(clerkUserId: string, invitationId: string) {
    const invitation = await this.getById(invitationId, clerkUserId);

    if (invitation.status !== 'pending') {
      throw new BadRequestError('Can only resend pending invitations');
    }

    await this.repository.update(invitationId, {
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await this.eventPublisher?.publish('invitation.created', {
      invitation_id: invitation.id,
      organization_id: invitation.organization_id,
      company_id: invitation.company_id,
      email: invitation.email,
      role: invitation.role,
      invited_by: invitation.invited_by,
    }, 'identity-service');
  }

  private requireCompanyAdminOrPlatformAdmin(
    context: { isPlatformAdmin: boolean; roles: string[]; organizationIds: string[]; companyIds: string[] },
    organizationId: string
  ): void {
    if (context.isPlatformAdmin) return;
    if (!context.roles.includes('company_admin')) {
      throw new ForbiddenError('You must be a company admin');
    }
    if (!context.organizationIds.includes(organizationId)) {
      throw new ForbiddenError('You must be a member of this organization');
    }
  }
}
