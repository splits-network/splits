/**
 * Enriched Placements View Service
 * Role-based scoping + enriched data
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { EnrichedPlacementRepository } from './enriched.repository';
import { PlacementScopeFilters } from '../repository';
import { PlacementListParams } from '../types';

export class EnrichedPlacementService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EnrichedPlacementRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getEnriched(params: PlacementListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: PlacementScopeFilters = {};

    if (context.isPlatformAdmin) {
      // Admins see everything
    } else if (context.candidateId) {
      scopeFilters.candidate_id = context.candidateId;
    } else if (context.recruiterId) {
      scopeFilters.recruiter_id = context.recruiterId;
    } else if (context.organizationIds.length > 0) {
      scopeFilters.organization_ids = context.organizationIds;
    } else {
      return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    const { data, total } = await this.repository.findEnriched(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
