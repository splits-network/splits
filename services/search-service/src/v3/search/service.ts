/**
 * Search V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SearchRepository } from './repository';
import { SearchParams } from './types';

export class SearchService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: SearchRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async search(params: SearchParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const mode = params.mode || 'typeahead';
    const filters = params.filters ? JSON.parse(params.filters) : undefined;

    if (mode === 'typeahead') {
      const results = await this.repository.typeaheadSearch(
        params.q || '',
        context,
        params.entity_type,
        Math.min(params.limit || 5, 25),
      );
      return { results };
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const { data, total } = await this.repository.fullSearch(
      params.q || '',
      context,
      params.entity_type,
      page,
      limit,
      filters,
    );

    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
