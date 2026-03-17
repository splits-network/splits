/**
 * Subscriptions V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SubscriptionListParams } from './types';

export interface SubscriptionScopeFilters {
  user_id?: string;
}

export class SubscriptionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: SubscriptionListParams,
    scopeFilters?: SubscriptionScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('subscriptions')
      .select('*', { count: 'exact' });

    if (scopeFilters?.user_id) {
      query = query.eq('user_id', scopeFilters.user_id);
    }
    if (params.plan_id) query = query.eq('plan_id', params.plan_id);
    if (params.status) query = query.eq('status', params.status);

    const sortBy = params.sort_by || 'created_at';
    const ascending = (params.sort_order || 'desc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByUserId(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
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
}
