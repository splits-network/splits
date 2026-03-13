/**
 * Leaderboards V3 Service — Read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { LeaderboardRepository } from './repository';
import { LeaderboardListParams } from './types';

export class LeaderboardService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: LeaderboardRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: LeaderboardListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('LeaderboardEntry', id);
    return entry;
  }
}
