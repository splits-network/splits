/**
 * Fraud Signals V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { FraudSignalRepository } from './repository.js';
import { CreateFraudSignalInput, UpdateFraudSignalInput, FraudSignalListParams } from './types.js';

export class FraudSignalService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: FraudSignalRepository, private supabase: SupabaseClient, private eventPublisher?: IEventPublisher) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: FraudSignalListParams, clerkUserId: string) {
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
    const signal = await this.repository.findById(id);
    if (!signal) throw new NotFoundError('FraudSignal', id);
    return signal;
  }

  async create(input: CreateFraudSignalInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const created = await this.repository.create({ ...input, status: 'active' });
    await this.eventPublisher?.publish('fraud_signal.created', { signal_id: created.id, severity: input.severity }, 'automation-service');
    return created;
  }

  async update(id: string, input: UpdateFraudSignalInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('FraudSignal', id);
    const updateData: Record<string, any> = { ...input };
    if (input.status && input.status !== 'active') {
      updateData.reviewed_by = context.identityUserId;
      updateData.reviewed_at = new Date().toISOString();
    }
    return this.repository.update(id, updateData);
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('FraudSignal', id);
    await this.repository.delete(id);
  }
}
