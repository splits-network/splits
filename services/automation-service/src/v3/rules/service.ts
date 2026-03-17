/**
 * Automation Rules V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { RuleRepository } from './repository';
import { CreateRuleInput, UpdateRuleInput, RuleListParams } from './types';

export class RuleService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RuleRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RuleListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const rule = await this.repository.findById(id);
    if (!rule) throw new NotFoundError('AutomationRule', id);
    return rule;
  }

  async create(input: CreateRuleInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const created = await this.repository.create({ ...input, created_by: context.identityUserId, status: 'active' });
    await this.eventPublisher?.publish('automation_rule.created', { rule_id: created.id }, 'automation-service');
    return created;
  }

  async update(id: string, input: UpdateRuleInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('AutomationRule', id);
    return this.repository.update(id, input);
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('AutomationRule', id);
    await this.repository.delete(id);
  }
}
