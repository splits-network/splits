/**
 * User Role Detail View Service
 * GET /api/v3/user-roles/:id/view/detail
 * GET /api/v3/user-roles/views/detail
 *
 * Returns user role(s) with joined user and role data.
 * Access: platform admin only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { UserRoleDetailViewRepository } from './detail.repository';
import { UserRoleListParams } from '../types';

export class UserRoleDetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: UserRoleDetailViewRepository,
    supabase: SupabaseClient
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

  async getDetail(id: string, clerkUserId: string) {
    await this.requirePlatformAdmin(clerkUserId);
    const userRole = await this.repository.findById(id);
    if (!userRole) throw new NotFoundError('UserRole', id);
    return userRole;
  }

  async getList(params: UserRoleListParams, clerkUserId: string) {
    await this.requirePlatformAdmin(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
