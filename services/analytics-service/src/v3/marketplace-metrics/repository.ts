/**
 * Marketplace Metrics V3 Repository — Core CRUD
 *
 * Queries analytics.marketplace_health_daily via Supabase.
 * Uses analytics schema. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MarketplaceMetricListParams } from './types.js';

export class MarketplaceMetricRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: MarketplaceMetricListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('marketplace_health_daily')
      .select('*', { count: 'exact' });

    if (params.date_from) query = query.gte('date', params.date_from);
    if (params.date_to) query = query.lte('date', params.date_to);

    query = query.order('date', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('marketplace_health_daily')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('marketplace_health_daily')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('marketplace_health_daily')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('marketplace_health_daily')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
