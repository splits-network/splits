/**
 * Escrow Holds V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { EscrowHoldRepository } from './repository.js';
import { CreateEscrowHoldInput, UpdateEscrowHoldInput, EscrowHoldListParams } from './types.js';

export class EscrowHoldService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EscrowHoldRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: EscrowHoldListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const hold = await this.repository.findById(id);
    if (!hold) throw new NotFoundError('EscrowHold', id);
    return hold;
  }

  async create(input: CreateEscrowHoldInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can create escrow holds');
    }

    if (input.hold_amount <= 0) throw new BadRequestError('Hold amount must be positive');

    const record = {
      ...input,
      status: 'active',
      held_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('escrow_hold.created', {
      escrow_hold_id: created.id,
      placement_id: input.placement_id,
      hold_amount: input.hold_amount,
      created_by: context.identityUserId,
    }, 'billing-service');

    return created;
  }

  async update(id: string, input: UpdateEscrowHoldInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can update escrow holds');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('EscrowHold', id);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('EscrowHold', id);

    await this.eventPublisher?.publish('escrow_hold.updated', {
      escrow_hold_id: id,
      updated_fields: Object.keys(input),
      updated_by: context.identityUserId,
    }, 'billing-service');

    return updated;
  }

  async release(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can release escrow holds');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('EscrowHold', id);
    if (existing.status !== 'active') throw new BadRequestError('Only active holds can be released');

    const released = await this.repository.update(id, {
      status: 'released',
      released_at: new Date().toISOString(),
      released_by: context.identityUserId,
    });

    await this.eventPublisher?.publish('escrow_hold.released', {
      escrow_hold_id: id,
      placement_id: existing.placement_id,
      released_by: context.identityUserId,
    }, 'billing-service');

    return released;
  }

  async cancel(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can cancel escrow holds');
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('EscrowHold', id);
    if (existing.status !== 'active') throw new BadRequestError('Only active holds can be cancelled');

    const cancelled = await this.repository.update(id, { status: 'cancelled' });

    await this.eventPublisher?.publish('escrow_hold.cancelled', {
      escrow_hold_id: id,
      placement_id: existing.placement_id,
      cancelled_by: context.identityUserId,
    }, 'billing-service');

    return cancelled;
  }

  async getPlacementHolds(placementId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    return this.repository.findByPlacementId(placementId);
  }

  async getPlacementHoldTotal(placementId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const total = await this.repository.getTotalActiveHolds(placementId);
    return { total_active_holds: total };
  }
}
