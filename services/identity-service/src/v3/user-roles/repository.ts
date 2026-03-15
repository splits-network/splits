/**
 * User Roles V3 Repository — Pure data layer
 *
 * NO role logic. Scope filtering set by service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserRoleListParams } from './types';

const USER_ROLE_SELECT = '*, users(*), roles!user_roles_role_name_fkey(*)';

export class UserRoleRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: UserRoleListParams
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('user_roles')
      .select(USER_ROLE_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (params.user_id) query = query.eq('user_id', params.user_id);
    if (params.role_name) query = query.eq('role_name', params.role_name);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(USER_ROLE_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .insert(record)
      .select(USER_ROLE_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(USER_ROLE_SELECT)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
