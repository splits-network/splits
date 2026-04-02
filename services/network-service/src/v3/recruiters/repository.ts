/**
 * Recruiters V3 Repository — Core CRUD
 *
 * Flat select('*') only. NO joins, NO include, NO reputation sorting.
 * Views handle enrichment (marketplace-listing, by-slug detail, etc.)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterListParams, RecruiterUpdate } from './types.js';

const SORTABLE_FIELDS = new Set([
  'created_at', 'updated_at', 'name', 'status', 'specialization',
]);

export class RecruiterRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RecruiterListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiters').select('*', { count: 'exact' });

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

    const sortBy = SORTABLE_FIELDS.has(params.sort_by || '') ? params.sort_by! : 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiters').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiters').select('*').eq('slug', slug).maybeSingle();
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

  async findUserNameByUserId(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase.from('users').select('name').eq('id', userId).maybeSingle();
    if (error || !data) return null;
    return data.name || null;
  }

  async isSlugTaken(slug: string, excludeRecruiterId?: string): Promise<boolean> {
    let query = this.supabase.from('recruiters').select('id').eq('slug', slug);
    if (excludeRecruiterId) query = query.neq('id', excludeRecruiterId);
    const { data } = await query.maybeSingle();
    return !!data;
  }

  async createUserRole(userId: string, recruiterId: string): Promise<void> {
    const { error } = await this.supabase.from('user_roles').insert({
      user_id: userId, role_name: 'recruiter', role_entity_id: recruiterId,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    if (error && error.code !== '23505') throw error;
  }
}
