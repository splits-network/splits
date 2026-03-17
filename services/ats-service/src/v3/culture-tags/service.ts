/**
 * Culture Tags V3 Service — Business Logic
 *
 * Anyone can list/search culture tags. Admins can create/delete.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { CultureTagRepository } from './repository';
import { CreateCultureTagInput, CultureTagListParams } from './types';

export class CultureTagService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CultureTagRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CultureTagListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const tag = await this.repository.findById(id);
    if (!tag) throw new NotFoundError('CultureTag', id);
    return tag;
  }

  async create(input: CreateCultureTagInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can create culture tags');
    }

    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.repository.findBySlug(slug);
    if (existing) return existing;

    const record = {
      name: input.name,
      slug,
      created_by: context.identityUserId,
    };

    return this.repository.create(record);
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('CultureTag', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete culture tags');
    }

    await this.repository.delete(id);
  }
}
