/**
 * Recruiters V3 Repository — Pure Data Layer
 *
 * NO role logic. Scope filters passed from service.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterListParams, RecruiterUpdate } from './types';

interface ScopeFilters {
  recruiter_ids?: string[];
}

export class RecruiterRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RecruiterListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    const selectClause = this.buildSelectClause(params.include);
    let query = this.supabase.from('recruiters').select(selectClause, { count: 'exact' });

    if (scopeFilters?.recruiter_ids?.length) {
      query = query.in('id', scopeFilters.recruiter_ids);
    }

    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(t => t).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }
    if (params.status) query = query.eq('status', params.status);
    if (params.specialization && !params.search) {
      query = query.ilike('specialization', `%${params.specialization}%`);
    }
    if (params.is_candidate_recruiter === 'yes') query = query.eq('candidate_recruiter', true);
    else if (params.is_candidate_recruiter === 'no') query = query.eq('candidate_recruiter', false);
    if (params.is_company_recruiter === 'yes') query = query.eq('company_recruiter', true);
    else if (params.is_company_recruiter === 'no') query = query.eq('company_recruiter', false);
    if (params.is_marketplace_enabled === 'yes') query = query.eq('marketplace_enabled', true);
    else if (params.is_marketplace_enabled === 'no') query = query.eq('marketplace_enabled', false);

    if (params.filters?.marketplace_enabled !== undefined) {
      query = query.eq('marketplace_enabled', params.filters.marketplace_enabled);
    }
    if (params.filters?.company_ids?.length) {
      const { data: rels } = await this.supabase
        .from('recruiter_companies').select('recruiter_id')
        .in('company_id', params.filters.company_ids).eq('status', 'active');
      const ids = rels?.map(r => r.recruiter_id) || [];
      if (ids.length === 0) return { data: [], total: 0 };
      query = query.in('id', ids);
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    const reputationColumns = new Set([
      'reputation_score', 'total_submissions', 'total_hires',
      'hire_rate', 'completion_rate', 'quality_score',
      'avg_time_to_hire_days', 'avg_response_time_hours',
    ]);
    const serviceSortedColumns = new Set(['plan_tier']);

    if (serviceSortedColumns.has(sortBy)) {
      query = query.order('created_at', { ascending: false });
    } else if (reputationColumns.has(sortBy)) {
      query = query.order(sortBy, { ascending, referencedTable: 'recruiter_reputation' });
    } else {
      query = query.order(sortBy, { ascending });
    }

    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string, include?: string): Promise<any | null> {
    const selectClause = this.buildSelectClause(include);
    const { data, error } = await this.supabase.from('recruiters').select(selectClause).eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string, include?: string): Promise<any | null> {
    const selectClause = this.buildSelectClause(include);
    const { data, error } = await this.supabase.from('recruiters').select(selectClause).eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findByUserId(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiters').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('recruiters').insert(record).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiters').update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) { if (error.code === 'PGRST116') return null; throw error; }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('recruiters').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async isSlugTaken(slug: string, excludeRecruiterId?: string): Promise<boolean> {
    let query = this.supabase.from('recruiters').select('id').eq('slug', slug);
    if (excludeRecruiterId) query = query.neq('id', excludeRecruiterId);
    const { data } = await query.maybeSingle();
    return !!data;
  }

  async batchGetPlanTiers(recruiterIds: string[]): Promise<Map<string, string>> {
    const tierMap = new Map<string, string>();
    if (recruiterIds.length === 0) return tierMap;
    const { data } = await this.supabase
      .from('subscriptions').select('recruiter_id, plan:plans(tier)')
      .in('recruiter_id', recruiterIds).in('status', ['active', 'trialing']);
    for (const row of data || []) {
      tierMap.set(row.recruiter_id, (row.plan as any)?.tier ?? 'starter');
    }
    return tierMap;
  }

  async createUserRole(userId: string, recruiterId: string): Promise<void> {
    const { error } = await this.supabase.from('user_roles').insert({
      user_id: userId, role_name: 'recruiter', role_entity_id: recruiterId,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    if (error && error.code !== '23505') throw error;
  }

  async getResponseMetrics(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_response_metrics_latest')
      .select('response_rate, avg_response_time_hours')
      .eq('recruiter_id', recruiterId).maybeSingle();
    if (error) return null;
    return data;
  }

  private buildSelectClause(include?: string): string {
    const parts: string[] = ['*'];
    if (!include) return parts.join(', ');
    for (const inc of include.split(',').map(i => i.trim())) {
      switch (inc) {
        case 'user': parts.push('users!user_id(id, name, email, created_at, profile_image_url)'); break;
        case 'reputation': parts.push('recruiter_reputation!recruiter_id(recruiter_id, total_submissions, total_hires, hire_rate, total_placements, completed_placements, failed_placements, completion_rate, total_collaborations, collaboration_rate, avg_response_time_hours, reputation_score, last_calculated_at, created_at, updated_at)'); break;
        case 'firm': parts.push('firm_members!recruiter_id(firm_id, role, firms!firm_id(id, name, slug))'); break;
        case 'activity': parts.push('recruiter_activity_recent!recruiter_id(id, activity_type, description, metadata, created_at)'); break;
      }
    }
    return parts.join(', ');
  }
}
