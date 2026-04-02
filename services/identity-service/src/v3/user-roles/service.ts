/**
 * User Roles V3 Service — Business Logic
 *
 * Platform admin only. Entity roles managed by backend services.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { UserRoleRepository } from './repository.js';
import { CreateUserRoleInput, UpdateUserRoleInput, UserRoleListParams } from './types.js';

const SYSTEM_ROLES = ['platform_admin'];

export class UserRoleService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: UserRoleRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requirePlatformAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Platform admin permissions required');
    }
    return context;
  }

  async getAll(params: UserRoleListParams, clerkUserId: string) {
    await this.requirePlatformAdmin(clerkUserId);

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.requirePlatformAdmin(clerkUserId);

    const userRole = await this.repository.findById(id);
    if (!userRole) throw new NotFoundError('UserRole', id);
    return userRole;
  }

  async create(input: CreateUserRoleInput, clerkUserId: string) {
    if (!input.user_id) throw new BadRequestError('User ID is required');
    if (!input.role_name) throw new BadRequestError('Role name is required');

    const isSystemRole = SYSTEM_ROLES.includes(input.role_name);
    if (!isSystemRole && !input.role_entity_id) {
      throw new BadRequestError('Role entity ID is required for entity-linked roles');
    }

    const now = new Date().toISOString();
    const created = await this.repository.create({
      user_id: input.user_id,
      role_name: input.role_name,
      role_entity_id: input.role_entity_id || null,
      created_at: now,
      updated_at: now,
    });

    await this.eventPublisher?.publish('user_role.created', {
      user_role_id: created.id,
      user_id: created.user_id,
      role_name: created.role_name,
      role_entity_id: created.role_entity_id,
    }, 'identity-service');

    return created;
  }

  async update(id: string, input: UpdateUserRoleInput, clerkUserId: string) {
    await this.requirePlatformAdmin(clerkUserId);

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('UserRole', id);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('UserRole', id);

    await this.eventPublisher?.publish('user_role.updated', {
      user_role_id: id,
      changes: input,
    }, 'identity-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    await this.requirePlatformAdmin(clerkUserId);

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('UserRole', id);

    await this.repository.delete(id);

    await this.eventPublisher?.publish('user_role.deleted', {
      user_role_id: id,
      user_id: existing.user_id,
      role_name: existing.role_name,
      role_entity_id: existing.role_entity_id,
    }, 'identity-service');
  }
}
