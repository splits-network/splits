/**
 * Enriched Placements View Service
 * Role-based scoping + enriched data
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { EnrichedPlacementRepository } from './enriched.repository';
import { PlacementScopeFilters } from './scoped-list.repository';
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

    // Compute recruiter_share from splits for the current recruiter
    if (context.recruiterId) {
      for (const p of data) {
        if (p.splits?.length) {
          p.recruiter_share = p.splits
            .filter((s: any) => s.recruiter_id === context.recruiterId)
            .reduce((sum: number, s: any) => sum + (s.split_amount || 0), 0);
        }
      }
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
