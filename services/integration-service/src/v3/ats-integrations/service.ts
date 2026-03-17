/**
 * ATS Integrations V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { ATSIntegrationRepository } from './repository';
import { CreateATSInput, UpdateATSInput, ATSListParams } from './types';

export class ATSIntegrationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ATSIntegrationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: ATSListParams, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.accessResolver.resolve(clerkUserId, headers);
    if (!params.company_id) throw new BadRequestError('company_id is required');
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.accessResolver.resolve(clerkUserId, headers);
    const integration = await this.repository.findById(id);
    if (!integration) throw new NotFoundError('ATSIntegration', id);
    return integration;
  }

  async create(input: CreateATSInput, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.accessResolver.resolve(clerkUserId, headers);
    const created = await this.repository.create(input);

    await this.eventPublisher?.publish('ats_integration.created', {
      integration_id: created.id,
      company_id: input.company_id,
      platform: input.platform,
    }, 'integration-service');

    return created;
  }

  async update(id: string, input: UpdateATSInput, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.accessResolver.resolve(clerkUserId, headers);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('ATSIntegration', id);
    return this.repository.update(id, input);
  }

  async delete(id: string, clerkUserId: string, headers?: Record<string, unknown>) {
    await this.accessResolver.resolve(clerkUserId, headers);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('ATSIntegration', id);
    await this.repository.delete(id);

    await this.eventPublisher?.publish('ats_integration.deleted', {
      integration_id: id,
      company_id: existing.company_id,
    }, 'integration-service');
  }
}
