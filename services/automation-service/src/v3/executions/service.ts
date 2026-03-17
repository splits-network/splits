/**
 * Automation Executions V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { ExecutionRepository } from './repository';
import { ExecutionListParams } from './types';

export class ExecutionService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ExecutionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: ExecutionListParams, clerkUserId: string) {
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
    const execution = await this.repository.findById(id);
    if (!execution) throw new NotFoundError('Execution', id);
    return execution;
  }

  async update(id: string, input: Record<string, any>, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Execution', id);
    const updated = await this.repository.update(id, input);
    await this.eventPublisher?.publish('automation_execution.updated', { execution_id: id, status: updated.status }, 'automation-service');
    return updated;
  }
}
