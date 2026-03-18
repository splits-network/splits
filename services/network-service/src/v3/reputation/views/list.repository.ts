/**
 * Reputation List View Repository
 * GET /api/v3/reputation/views/list
 *
 * Returns reputation records with recruiter joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ReputationListParams } from '../types';

const LIST_SELECT = '*, recruiter:recruiters(id, name, email)';

export class ReputationListViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ReputationListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('recruiter_reputation')
      .select(LIST_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (params.recruiter_id) {
      query = query.eq('recruiter_id', params.recruiter_id);
    }

    const sortBy = params.sort_by || 'reputation_score';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
