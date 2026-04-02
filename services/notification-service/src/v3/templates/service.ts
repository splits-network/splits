/**
 * Email Templates V3 Service — Business Logic
 *
 * Admin-only CRUD. Validates template structure. No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { TemplateRepository } from './repository.js';
import { CreateTemplateInput, UpdateTemplateInput, TemplateListParams } from './types.js';
import { IEventPublisher } from '../../v2/shared/events.js';

export class TemplateService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: TemplateRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can manage email templates');
    }
    return context;
  }

  async getAll(params: TemplateListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const template = await this.repository.findById(id);
    if (!template) throw new NotFoundError('Template', id);
    return template;
  }

  async create(input: CreateTemplateInput, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const record = {
      name: input.name || null,
      event_type: input.event_type,
      subject: input.subject,
      template_html: input.template_html,
      status: input.status || 'draft',
      variables: input.variables || [],
    };
    const template = await this.repository.create(record);

    await this.eventPublisher?.publish('template.created', {
      template_id: template.id,
      event_type: template.event_type,
    }, 'notification-service');

    return template;
  }

  async update(id: string, input: UpdateTemplateInput, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Template', id);
    const template = await this.repository.update(id, input);

    await this.eventPublisher?.publish('template.updated', {
      template_id: template.id,
      event_type: template.event_type,
    }, 'notification-service');

    return template;
  }

  async delete(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Template', id);
    await this.repository.delete(id);

    await this.eventPublisher?.publish('template.deleted', {
      template_id: id,
    }, 'notification-service');
  }
}
