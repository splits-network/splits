/**
 * Providers V3 Repository — Read-only
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ProviderListParams } from './types.js';

const SORTABLE_FIELDS = ['name', 'created_at'];

export class ProviderRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ProviderListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('integration_providers')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'name';
    query = query.order(sortBy, { ascending: params.sort_order !== 'desc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('integration_providers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
