/**
 * Recruiter-Candidates List View Repository
 * GET /api/v3/recruiter-candidates/views/list
 *
 * Returns recruiter-candidates with candidate and recruiter joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCandidateListParams } from '../types';

interface ScopeFilters {
  recruiter_id?: string;
  candidate_id?: string;
}

const LIST_SELECT = [
  '*',
  'candidate:candidates!candidate_id!inner(id, user_id, email, full_name, phone, location, linkedin_url, current_title, current_company, user:users!candidates_user_id_fkey(name, email))',
  'recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users!recruiters_user_id_fkey(name, email))',
].join(',');

export class RecruiterCandidateListViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: RecruiterCandidateListParams,
    scopeFilters?: ScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;
    const filters = params.filters || {};

    let query = this.supabase
      .from('recruiter_candidates')
      .select(LIST_SELECT, { count: 'exact' });

    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (scopeFilters?.candidate_id) query = query.eq('candidate_id', scopeFilters.candidate_id);

    if (filters.status && filters.status !== '' && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.consent_status === 'given') query = query.eq('consent_given', true);
    else if (filters.consent_status === 'pending') query = query.eq('consent_given', false).is('declined_at', null);
    else if (filters.consent_status === 'declined') query = query.not('declined_at', 'is', null);

    if (filters.expiry_status === 'active') query = query.gte('invitation_expires_at', new Date().toISOString());
    else if (filters.expiry_status === 'expired') query = query.lt('invitation_expires_at', new Date().toISOString()).not('invitation_expires_at', 'is', null);
    else if (filters.expiry_status === 'no_expiry') query = query.is('invitation_expires_at', null);

    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(t => t).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
