/**
 * Users V3 Repository — Pure data layer
 *
 * NO role logic. Scope filtering set by service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserListParams } from './types';

export class UserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: UserListParams,
    scopeFilters?: { user_id?: string }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('users').select('*', { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.user_id) {
      query = query.eq('id', scopeFilters.user_id);
    }

    if (params.search) {
      query = query.or(
        `email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
      );
    }
    if (params.status) query = query.eq('status', params.status);
    if (params.clerk_user_id) query = query.eq('clerk_user_id', params.clerk_user_id);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByClerkId(clerkUserId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('users')
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
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async updateLastActive(userId: string): Promise<void> {
    const threshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { error } = await this.supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId)
      .or(`last_active_at.is.null,last_active_at.lt.${threshold}`);

    if (error) throw error;
  }
}
