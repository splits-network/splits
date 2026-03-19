/**
 * Candidate Enriched List View Repository
 *
 * Returns paginated candidates with recruiter_candidates relationships
 * joined, so the service can compute representation status per candidate.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateListParams } from '../types';

interface ScopeFilters {
  candidate_ids?: string[];
  user_id?: string;
  exclude_hidden_marketplace?: boolean;
}

export class CandidateEnrichedRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CandidateListParams,
    scopeFilters?: ScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidates')
      .select(`
        *,
        recruiter_relationships:recruiter_candidates(
          recruiter_id,
          status,
          consent_given,
          invitation_expires_at,
          declined_at
        )
      `, { count: 'exact' });

    // Role-based scoping
    if (scopeFilters?.candidate_ids && scopeFilters.candidate_ids.length > 0) {
      query = query.in('id', scopeFilters.candidate_ids);
    }
    if (scopeFilters?.user_id) {
      query = query.eq('user_id', scopeFilters.user_id);
    }

    // Marketplace visibility — hidden candidates must not appear in browse listings.
    // This is a hard filter, not client-controlled.
    if (scopeFilters?.exclude_hidden_marketplace) {
      query = query.neq('marketplace_visibility', 'hidden');
    }

    // User-supplied filters
    if (params.status) query = query.eq('status', params.status);

    // Full-text search
    if (params.search) {
      const tsquery = params.search
        .replace(/[@+._\-/:]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(t => t)
        .join(' & ');
      query = query.textSearch('search_vector', tsquery, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Sorting
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
