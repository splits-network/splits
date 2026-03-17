/**
 * Reputation V3 Service — Read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { ReputationRepository } from './repository';
import { ReputationListParams, getTierFromScore } from './types';

export class ReputationService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: ReputationRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: ReputationListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const enriched = data.map((r: any) => ({ ...r, tier: getTierFromScore(r.reputation_score) }));
    return { data: enriched, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getByRecruiterId(recruiterId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const reputation = await this.repository.findByRecruiterId(recruiterId);
    if (!reputation) throw new NotFoundError('Reputation', recruiterId);
    return { ...reputation, tier: getTierFromScore(reputation.reputation_score) };
  }
}
