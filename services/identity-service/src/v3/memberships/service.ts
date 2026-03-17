/**
 * Memberships V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { MembershipRepository } from './repository';
import { CreateMembershipInput, UpdateMembershipInput, MembershipListParams } from './types';

export class MembershipService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MembershipRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: MembershipListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { user_id?: string; organization_ids?: string[] } = {};

    if (!context.isPlatformAdmin) {
      if (params.company_id) {
        // Any authenticated user can view members of a company
      } else if (params.organization_id) {
        if (!context.organizationIds.includes(params.organization_id)) {
          throw new ForbiddenError('You do not have access to this organization');
        }
      } else {
        scopeFilters.user_id = context.identityUserId as string;
      }
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const membership = await this.repository.findById(id);
    if (!membership) throw new NotFoundError('Membership', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      if (!context.organizationIds.includes(membership.organization_id)) {
        throw new ForbiddenError('You do not have access to this membership');
      }
    }
    return membership;
  }

  async create(input: CreateMembershipInput, clerkUserId: string) {
    if (!input.user_id) throw new BadRequestError('User ID is required');
    if (!input.role_name) throw new BadRequestError('Role name is required');
    if (!input.organization_id) throw new BadRequestError('Organization ID is required');

    const context = await this.accessResolver.resolve(clerkUserId);
    const isSelfAssignment = context.identityUserId === input.user_id;

    if (isSelfAssignment) {
      const existingCount = await this.repository.countByOrganization(input.organization_id);
      if (existingCount > 0) {
        this.requireCompanyAdminOrPlatformAdmin(context, input.organization_id);
      }
      // First membership for org = self-bootstrap allowed
    } else {
      this.requireCompanyAdminOrPlatformAdmin(context, input.organization_id);
    }

    const now = new Date().toISOString();
    const created = await this.repository.create({
      user_id: input.user_id,
      role_name: input.role_name,
      organization_id: input.organization_id,
      company_id: input.company_id || null,
      created_at: now,
      updated_at: now,
    });

    await this.eventPublisher?.publish('membership.created', {
      membership_id: created.id,
      user_id: created.user_id,
      role_name: created.role_name,
      organization_id: created.organization_id,
      company_id: created.company_id,
    }, 'identity-service');

    return created;
  }

  async update(id: string, input: UpdateMembershipInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Membership', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    this.requireCompanyAdminOrPlatformAdmin(context, existing.organization_id);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Membership', id);

    await this.eventPublisher?.publish('membership.updated', {
      membership_id: id,
      changes: input,
    }, 'identity-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Membership', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    this.requireCompanyAdminOrPlatformAdmin(context, existing.organization_id);

    await this.repository.delete(id);

    await this.eventPublisher?.publish('membership.deleted', {
      membership_id: id,
    }, 'identity-service');
  }

  private requireCompanyAdminOrPlatformAdmin(
    context: { isPlatformAdmin: boolean; roles: string[]; organizationIds: string[] },
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
