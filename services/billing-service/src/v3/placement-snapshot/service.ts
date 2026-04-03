/**
 * Placement Snapshot V3 Service — Business Logic
 *
 * Resolves rates from splits_rates table,
 * resolves firm context per role, creates immutable snapshot.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { PlacementSnapshotRepository } from './repository.js';
import { PlacementSnapshotCreate, PlacementSnapshotListParams } from './types.js';

export class PlacementSnapshotService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PlacementSnapshotRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: PlacementSnapshotListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions to view snapshots');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getByPlacementId(placementId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions to view snapshot');
    }

    const snapshot = await this.repository.getByPlacementId(placementId);
    if (!snapshot) throw new NotFoundError('PlacementSnapshot', placementId);
    return snapshot;
  }

  async createSnapshot(input: PlacementSnapshotCreate, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can create snapshots');
    }

    if (!input.placement_id) throw new BadRequestError('placement_id is required');
    if (!input.total_placement_fee || input.total_placement_fee <= 0) {
      throw new BadRequestError('total_placement_fee must be positive');
    }

    // Check idempotency — don't create duplicate
    const existing = await this.repository.getByPlacementId(input.placement_id);
    if (existing) return existing;

    const record = { ...input, created_at: new Date().toISOString() };
    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('placement_snapshot.created', {
      placement_id: input.placement_id,
      total_placement_fee: input.total_placement_fee,
      created_by: context.identityUserId,
    }, 'billing-service');

    return created;
  }
}
