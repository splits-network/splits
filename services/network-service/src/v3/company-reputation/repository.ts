/**
 * Company Reputation V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyReputationListParams } from './types';

export class CompanyReputationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: CompanyReputationListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('company_reputation')
      .select('*, company:companies(id, name)', { count: 'exact' });

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
      .select('*, company:companies(id, name)')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
