/**
 * Organizations V3 Repository — Pure data layer
 *
 * NO role logic. Scope filtering set by service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { OrganizationListParams } from './types.js';

export class OrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: OrganizationListParams,
    scopeFilters?: { organization_ids?: string[] }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('organizations').select('*', { count: 'exact' });

    if (scopeFilters?.organization_ids && scopeFilters.organization_ids.length > 0) {
      query = query.in('id', scopeFilters.organization_ids);
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
    }
    if (params.status) query = query.eq('status', params.status);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('organizations')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('organizations')
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

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('organizations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
