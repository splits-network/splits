/**
 * Navigation V3 Service — Business Logic
 *
 * Public reads. Admin-only writes (upsert by app+location).
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { NavigationRepository } from './repository';
import { NavigationListParams, UpsertNavigationInput } from './types';

export class NavigationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: NavigationRepository,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: NavigationListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const nav = await this.repository.findById(id);
    if (!nav) throw new NotFoundError('Navigation', id);
    return nav;
  }

  async upsert(input: UpsertNavigationInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can manage navigation');
    }
    return this.repository.upsert({
      app: input.app,
      location: input.location,
      items: input.items,
    });
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete navigation');
    }
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Navigation', id);
    await this.repository.delete(id);
  }
}
