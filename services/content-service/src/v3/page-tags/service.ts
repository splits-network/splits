/**
 * Content Page Tags V3 Service — Business Logic
 *
 * Admin-only management of page-tag associations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { PageTagRepository } from './repository';
import { CreatePageTagInput } from './types';

export class PageTagService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PageTagRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listByPageId(pageId: string, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    return this.repository.findByPageId(pageId);
  }

  async create(input: CreatePageTagInput, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    return this.repository.create({
      page_id: input.page_id,
      tag_id: input.tag_id,
    });
  }

  async delete(pageId: string, tagId: string, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    await this.repository.delete(pageId, tagId);
  }

  async bulkReplace(
    pageId: string,
    tags: Array<{ tag_id: string }>,
    clerkUserId: string
  ) {
    await this.assertAdmin(clerkUserId);
    return this.repository.bulkReplace(pageId, tags);
  }

  private async assertAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can manage page tags');
    }
  }
}
