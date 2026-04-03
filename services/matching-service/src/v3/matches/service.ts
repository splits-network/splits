/**
 * Matches V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { MatchRepository } from './repository.js';
import { MatchListParams, UpdateMatchInput } from './types.js';

export class MatchService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MatchRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: MatchListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    // Role-based filtering applied at service level
    const filteredParams = { ...params };
    if (!context.isPlatformAdmin) {
      if (context.candidateId) {
        filteredParams.candidate_id = context.candidateId;
      }
    }

    const { data, total } = await this.repository.findAll(filteredParams);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const match = await this.repository.findById(id);
    if (!match) throw new NotFoundError('Match', id);

    if (!context.isPlatformAdmin && context.candidateId && match.candidate_id !== context.candidateId) {
      throw new ForbiddenError('Access denied');
    }

    return match;
  }

  async update(id: string, input: UpdateMatchInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Match', id);

    const updateData: Record<string, any> = { ...input };
    if (input.status === 'dismissed') {
      updateData.dismissed_by = context.identityUserId;
      updateData.dismissed_at = new Date().toISOString();
    }

    const updated = await this.repository.update(id, updateData);

    if (input.status === 'dismissed') {
      await this.eventPublisher?.publish('match.dismissed', {
        match_id: id,
        candidate_id: existing.candidate_id,
        job_id: existing.job_id,
        dismissed_by: context.identityUserId,
      }, 'matching-service');
    }

    return updated;
  }
}
