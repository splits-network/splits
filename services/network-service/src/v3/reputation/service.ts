/**
 * Reputation V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { ReputationRepository } from './repository';
import { ReputationListParams, ReputationUpdate } from './types';

export class ReputationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ReputationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: ReputationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('You do not have access to reputation records');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const reputation = await this.repository.findById(id);
    if (!reputation) throw new NotFoundError('Reputation', id);
    return reputation;
  }

  async create(
    input: { recruiter_id: string; rating?: number; total_placements?: number; successful_placements?: number },
    clerkUserId: string
  ) {
    if (!input.recruiter_id) throw new BadRequestError('recruiter_id is required');

    const existing = await this.repository.findByRecruiterId(input.recruiter_id);
    if (existing) throw new BadRequestError('Reputation record already exists for this recruiter');

    if (input.rating !== undefined && (input.rating < 0 || input.rating > 5)) {
      throw new BadRequestError('Rating must be between 0 and 5');
    }
    if (input.total_placements !== undefined && input.total_placements < 0) {
      throw new BadRequestError('Total placements cannot be negative');
    }
    if (input.successful_placements !== undefined && input.successful_placements < 0) {
      throw new BadRequestError('Successful placements cannot be negative');
    }
    if (input.total_placements !== undefined && input.successful_placements !== undefined &&
        input.successful_placements > input.total_placements) {
      throw new BadRequestError('Successful placements cannot exceed total placements');
    }

    const now = new Date().toISOString();
    const record = {
      ...input,
      rating: input.rating || 0,
      total_placements: input.total_placements || 0,
      successful_placements: input.successful_placements || 0,
      created_at: now,
      updated_at: now,
    };

    const reputation = await this.repository.create(record);
    await this.eventPublisher?.publish('reputation.created', {
      reputationId: reputation.id,
      recruiterId: reputation.recruiter_id,
    }, 'network-service');

    return reputation;
  }

  async update(id: string, updates: ReputationUpdate, clerkUserId: string) {
    if (updates.rating !== undefined && (updates.rating < 0 || updates.rating > 5)) {
      throw new BadRequestError('Rating must be between 0 and 5');
    }
    if (updates.total_placements !== undefined && updates.total_placements < 0) {
      throw new BadRequestError('Total placements cannot be negative');
    }
    if (updates.successful_placements !== undefined && updates.successful_placements < 0) {
      throw new BadRequestError('Successful placements cannot be negative');
    }

    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Reputation', id);

    const newTotal = updates.total_placements ?? current.total_placements;
    const newSuccessful = updates.successful_placements ?? current.successful_placements;
    if (newSuccessful > newTotal) {
      throw new BadRequestError('Successful placements cannot exceed total placements');
    }

    const reputation = await this.repository.update(id, updates);
    if (!reputation) throw new NotFoundError('Reputation', id);

    await this.eventPublisher?.publish('reputation.updated', {
      reputationId: id,
      updates: Object.keys(updates),
    }, 'network-service');

    return reputation;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Reputation', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete reputation records');
    }

    await this.repository.delete(id);
    await this.eventPublisher?.publish('reputation.deleted', { reputationId: id }, 'network-service');
  }
}
