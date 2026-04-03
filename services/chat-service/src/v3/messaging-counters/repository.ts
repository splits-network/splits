/**
 * Messaging Counters V3 Repository — Core CRUD
 *
 * Single table queries on messaging_initiation_counters. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MessagingCounterListParams } from './types.js';

export class MessagingCounterRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: MessagingCounterListParams,
    userId: string,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    const { data, count, error } = await this.supabase
      .from('messaging_initiation_counters')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('period_start', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('messaging_initiation_counters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getCurrentMonthCount(userId: string): Promise<number> {
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      .toISOString()
      .split('T')[0];

    const { data, error } = await this.supabase
      .from('messaging_initiation_counters')
      .select('count')
      .eq('user_id', userId)
      .eq('period_start', periodStart)
      .maybeSingle();

    if (error) throw error;
    return data?.count ?? 0;
  }
}
