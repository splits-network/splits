/**
 * Recruiter-Codes List View Repository
 * GET /api/v3/recruiter-codes/views/list
 *
 * Returns recruiter codes with recruiter + user joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCodeListParams } from '../types';

interface ScopeFilters {
  recruiter_id?: string;
}

const LIST_SELECT = '*, recruiter:recruiters!inner(id, user:users!recruiters_user_id_fkey!inner(name, email))';

export class RecruiterCodeListViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RecruiterCodeListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_codes').select(LIST_SELECT, { count: 'exact' }).is('deleted_at', null);

    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.or(`code.ilike.%${params.search}%,label.ilike.%${params.search}%`);
    if (params.is_default === 'yes') query = query.eq('is_default', true);
    else if (params.is_default === 'no') query = query.eq('is_default', false);
    if (params.expiry_status === 'active') query = query.gte('expiry_date', new Date().toISOString());
    else if (params.expiry_status === 'expired') query = query.lt('expiry_date', new Date().toISOString()).not('expiry_date', 'is', null);
    else if (params.expiry_status === 'no_expiry') query = query.is('expiry_date', null);
    if (params.has_usage_limit === 'yes') query = query.not('max_uses', 'is', null);
    else if (params.has_usage_limit === 'no') query = query.is('max_uses', null);

    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
