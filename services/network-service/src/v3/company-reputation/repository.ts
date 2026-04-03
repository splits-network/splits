/**
 * Company Reputation V3 Repository — Pure Data Layer
 *
 * Flat select('*') only. NO joins, NO enrichment.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyReputationListParams } from './types.js';

export class CompanyReputationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: CompanyReputationListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('company_reputation')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.company_id) {
      query = query.eq('company_id', params.company_id);
    }

    const sortBy = params.sort_by || 'reputation_score';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findByCompanyId(companyId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('company_reputation')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
