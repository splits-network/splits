/**
 * Culture Tags V3 Repository — Core CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CultureTagListParams } from './types.js';

export class CultureTagRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CultureTagListParams,
    scopeFilters?: Record<string, any>
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('culture_tags')
      .select('*', { count: 'exact' });

    if (params.q) query = query.ilike('name', `%${params.q.trim()}%`);

    query = query.order('name').range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('culture_tags')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('culture_tags')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('culture_tags')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('culture_tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
