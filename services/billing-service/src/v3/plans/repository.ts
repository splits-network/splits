/**
 * Plans V3 Repository — Core CRUD + filtered queries
 *
 * Pure data layer. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PlanListParams } from './types';

export interface PlanScopeFilters {
  // Plans are generally public; scope filters reserved for future use
}

export class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: PlanListParams,
    _scopeFilters?: PlanScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('plans')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    if (params.status) {
      const isActive = params.status === 'active';
      query = query.eq('is_active', isActive);
    }
    if (params.tier) {
      query = query.eq('tier', params.tier);
    }

    const sortBy = params.sort_by || 'price_monthly';
    const ascending = (params.sort_order || 'asc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('plans')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async archive(id: string): Promise<any | null> {
    return this.update(id, { is_active: false });
  }
}
