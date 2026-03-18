/**
 * Company-Invitations List View Repository
 * GET /api/v3/company-invitations/views/list
 *
 * Returns company invitations with recruiter + user joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyInvitationListParams } from '../types';

interface ScopeFilters {
  recruiter_id?: string;
}

const LIST_SELECT = '*, recruiter:recruiters!inner(id, user:users!recruiters_user_id_fkey!inner(name, email))';

export class CompanyInvitationListViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: CompanyInvitationListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_company_invitations').select(LIST_SELECT, { count: 'exact' }).is('deleted_at', null);
    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.invited_email) query = query.eq('invited_email', params.invited_email);
    if (params.search) query = query.or(`invited_email.ilike.%${params.search}%,company_name_hint.ilike.%${params.search}%,invite_code.ilike.%${params.search}%`);
    if (params.has_email === 'yes') query = query.not('email_sent_at', 'is', null);
    else if (params.has_email === 'no') query = query.is('email_sent_at', null);
    if (params.expiry_status === 'active') query = query.gte('expires_at', new Date().toISOString());
    else if (params.expiry_status === 'expired') query = query.lt('expires_at', new Date().toISOString());

    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
