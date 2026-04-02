/**
 * Enriched Saved Jobs View Service
 * Enforces salary visibility, candidate-only access
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { EnrichedSavedJobRepository } from './enriched.repository.js';
import { SavedJobListParams } from '../types.js';

export class EnrichedSavedJobService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EnrichedSavedJobRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getEnriched(params: SavedJobListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.candidateId) {
      throw new ForbiddenError('Candidate profile not found for user');
    }

    const { data, total } = await this.repository.findEnriched(context.candidateId, params);

    // Enforce salary visibility on embedded job data
    const shaped = data.map((item: any) => {
      if (item.job && !item.job.show_salary_range) {
        delete item.job.salary_min;
        delete item.job.salary_max;
      }
      if (item.job) {
        delete item.job.show_salary_range;
      }
      return item;
    });

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data: shaped,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
