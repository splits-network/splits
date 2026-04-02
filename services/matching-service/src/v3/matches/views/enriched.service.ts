/**
 * Enriched Matches View Service
 * Role-based scoping + enriched data
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { EnrichedMatchRepository } from './enriched.repository.js';
import { MatchListParams } from '../types.js';

export class EnrichedMatchService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EnrichedMatchRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getEnriched(params: MatchListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    const filteredParams = { ...params };
    if (!context.isPlatformAdmin) {
      if (context.candidateId) {
        filteredParams.candidate_id = context.candidateId;
      }
    }

    const { data, total } = await this.repository.findEnriched(filteredParams);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
