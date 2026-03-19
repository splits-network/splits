/**
 * Organizations V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { OrganizationRepository } from './repository';
import { CreateOrganizationInput, UpdateOrganizationInput, OrganizationListParams } from './types';

export class OrganizationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: OrganizationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: OrganizationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { organization_ids?: string[] } = {};

    if (!context.isPlatformAdmin) {
      // Non-admins only see their own organizations
      scopeFilters.organization_ids = context.organizationIds;
      if (scopeFilters.organization_ids.length === 0) {
        return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
      }
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const org = await this.repository.findById(id);
    if (!org) throw new NotFoundError('Organization', id);

    // Any authenticated user can view an org (needed for invitation flows)
    return org;
  }

  async create(input: CreateOrganizationInput, clerkUserId: string) {
    if (!input.name?.trim()) throw new BadRequestError('Organization name is required');
    if (!input.slug?.trim()) throw new BadRequestError('Organization slug is required');

    // Check slug uniqueness before insert
    const existing = await this.repository.findBySlug(input.slug);
    if (existing) throw new BadRequestError(`Organization slug "${input.slug}" is already taken`);

    const now = new Date().toISOString();
    const record = {
      name: input.name,
      slug: input.slug,
      type: input.type || 'company',
      created_at: now,
      updated_at: now,
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('organization.created', {
      organization_id: created.id,
      name: created.name,
      type: created.type,
    }, 'identity-service');

    return created;
  }

  async update(id: string, input: UpdateOrganizationInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Organization', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Platform admin permissions required');
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Organization', id);

    await this.eventPublisher?.publish('organization.updated', {
      organization_id: id,
      changes: input,
    }, 'identity-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Organization', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Platform admin permissions required');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('organization.deleted', {
      organization_id: id,
    }, 'identity-service');
  }
}
