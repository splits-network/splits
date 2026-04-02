/**
 * Firms List View Repository
 * GET /api/v3/firms/views/list
 *
 * Returns firms with member stats (enrichment from firm_members table).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { FirmListParams } from '../types.js';

interface ScopeFilters {
  firm_ids?: string[];
  billing_organization_ids?: string[];
}

export class FirmListViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: FirmListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('firms').select('*', { count: 'exact' });

    if (scopeFilters?.firm_ids) query = query.in('id', scopeFilters.firm_ids);
    if (scopeFilters?.billing_organization_ids) query = query.in('billing_organization_id', scopeFilters.billing_organization_ids);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.ilike('name', `%${params.search}%`);

    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: await this.enrichWithMemberStats(data || []), total: count || 0 };
  }

  private async enrichWithMemberStats(firms: any[]): Promise<any[]> {
    if (firms.length === 0) return firms;
    const firmIds = firms.map(t => t.id);
    const { data: memberCounts } = await this.supabase
      .from('firm_members').select('firm_id, status').in('firm_id', firmIds);
    const statsMap = new Map<string, { member_count: number; active_member_count: number }>();
    for (const m of memberCounts || []) {
      const s = statsMap.get(m.firm_id) || { member_count: 0, active_member_count: 0 };
      s.member_count++;
      if (m.status === 'active') s.active_member_count++;
      statsMap.set(m.firm_id, s);
    }
    for (const firm of firms) {
      const s = statsMap.get(firm.id) || { member_count: 0, active_member_count: 0 };
      firm.member_count = s.member_count;
      firm.active_member_count = s.active_member_count;
    }
    return firms;
  }
}
