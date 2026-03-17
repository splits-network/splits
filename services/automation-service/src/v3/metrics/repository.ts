/**
 * Marketplace Metrics V3 Repository — Read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MetricListParams } from './types';

const SORTABLE_FIELDS = ['metric_date', 'created_at'];

export class MetricRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: MetricListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('marketplace_metrics_daily').select('*', { count: 'exact' });
    if (params.date_from) query = query.gte('metric_date', params.date_from);
    if (params.date_to) query = query.lte('metric_date', params.date_to);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'metric_date';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('marketplace_metrics_daily').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }
}
