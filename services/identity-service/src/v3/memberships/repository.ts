/**
 * Memberships V3 Repository — Pure CRUD (flat select('*') only)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MembershipListParams } from './types';

export class MembershipRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: MembershipListParams,
    scopeFilters?: { user_id?: string; organization_ids?: string[] }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('memberships')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Role-based scoping
    if (scopeFilters?.user_id) {
      query = query.eq('user_id', scopeFilters.user_id);
    }
    if (scopeFilters?.organization_ids && scopeFilters.organization_ids.length > 0) {
      query = query.in('organization_id', scopeFilters.organization_ids);
    }

    // User-supplied filters
    if (params.user_id) query = query.eq('user_id', params.user_id);
    if (params.role_name) query = query.eq('role_name', params.role_name);
    if (params.organization_id) query = query.eq('organization_id', params.organization_id);
    if (params.company_id !== undefined) {
      if (params.company_id === null) {
        query = query.is('company_id', null);
      } else {
        query = query.eq('company_id', params.company_id);
      }
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('memberships')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('memberships')
      .insert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('memberships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('memberships')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async countByOrganization(organizationId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_at', null);

    if (error) throw error;
    return count || 0;
  }
}
