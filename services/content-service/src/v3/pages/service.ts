/**
 * Pages V3 Service — Business Logic
 *
 * Public reads (by slug). Admin-only writes.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { PageRepository } from './repository';
import { CreatePageInput, UpdatePageInput, PageListParams } from './types';
import { IEventPublisher } from '../../v2/shared/events';

export class PageService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PageRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireAdmin(clerkUserId: string, headers?: Record<string, unknown>) {
    const context = await this.accessResolver.resolve(clerkUserId, headers);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can manage content pages');
    }
    return context;
  }

  async getAll(params: PageListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const page = await this.repository.findById(id);
    if (!page) throw new NotFoundError('Page', id);
    return page;
  }

  async getBySlug(slug: string) {
    const page = await this.repository.findBySlug(slug);
    if (!page) throw new NotFoundError('Page', slug);
    return page;
  }

  async create(input: CreatePageInput, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.requireAdmin(clerkUserId, headers);

    const existing = await this.repository.findBySlug(input.slug);
    if (existing) {
      throw new BadRequestError(`Page with slug "${input.slug}" already exists`);
    }

    const record = {
      slug: input.slug,
      title: input.title,
      description: input.description || null,
      content_blocks: input.content_blocks || [],
      status: input.status || 'draft',
      app: input.app || null,
      page_type: input.page_type || null,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      og_image: input.og_image || null,
      published_at: input.status === 'published' ? new Date().toISOString() : null,
    };

    const page = await this.repository.create(record);

    await this.eventPublisher?.publish('page.created', {
      page_id: page.id,
      slug: page.slug,
    });

    return page;
  }

  async update(id: string, input: UpdatePageInput, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.requireAdmin(clerkUserId, headers);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Page', id);

    // Auto-set published_at when transitioning to published
    const updates: Record<string, any> = { ...input };
    if (input.status === 'published' && existing.status !== 'published') {
      updates.published_at = new Date().toISOString();
    }

    const page = await this.repository.update(id, updates);

    await this.eventPublisher?.publish('page.updated', {
      page_id: page.id,
      slug: page.slug,
    });

    return page;
  }

  async delete(id: string, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.requireAdmin(clerkUserId, headers);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Page', id);

    await this.repository.delete(id);

    await this.eventPublisher?.publish('page.deleted', {
      page_id: id,
      slug: existing.slug,
    });
  }
}
