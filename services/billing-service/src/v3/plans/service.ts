/**
 * Plans V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { PlanRepository } from './repository';
import { CreatePlanInput, UpdatePlanInput, PlanListParams } from './types';

export class PlanService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PlanRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: PlanListParams, _clerkUserId: string) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, _clerkUserId: string) {
    const plan = await this.repository.findById(id);
    if (!plan) throw new NotFoundError('Plan', id);
    return plan;
  }

  async create(input: CreatePlanInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can create plans');
    }

    if (!input.name) throw new BadRequestError('Plan name is required');
    if (!input.slug) throw new BadRequestError('Plan slug is required');
    if (!input.price_cents || input.price_cents <= 0) {
      throw new BadRequestError('price_cents must be greater than zero');
    }

    const record = {
      ...input,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('plan.created', {
      plan_id: created.id,
      created_by: context.identityUserId,
    }, 'billing-service');

    return created;
  }

  async update(id: string, input: UpdatePlanInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can update plans');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Plan', id);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Plan', id);

    await this.eventPublisher?.publish('plan.updated', {
      plan_id: id,
      updated_fields: Object.keys(input),
      updated_by: context.identityUserId,
    }, 'billing-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete plans');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Plan', id);

    await this.repository.archive(id);

    await this.eventPublisher?.publish('plan.archived', {
      plan_id: id,
      deleted_by: context.identityUserId,
    }, 'billing-service');
  }
}
