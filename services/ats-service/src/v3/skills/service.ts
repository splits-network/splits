/**
 * Skills V3 Service — Business Logic
 *
 * Anyone authenticated can list/search/create skills. Admins can delete.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { SkillRepository } from './repository.js';
import { CreateSkillInput, SkillListParams } from './types.js';

export class SkillService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SkillRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: SkillListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const skill = await this.repository.findById(id);
    if (!skill) throw new NotFoundError('Skill', id);
    return skill;
  }

  async create(input: CreateSkillInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

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
    if (!existing) throw new NotFoundError('Skill', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete skills');
    }

    await this.repository.delete(id);
  }
}
