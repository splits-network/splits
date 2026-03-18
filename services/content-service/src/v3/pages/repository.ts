/**
 * Pages V3 Repository — Core CRUD
 *
 * Single table queries on content_pages. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PageListParams } from './types';

export class PageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: PageListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('content_pages')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.status) query = query.eq('status', params.status);
    if (params.app) query = query.eq('app', params.app);
    if (params.page_type) query = query.eq('page_type', params.page_type);
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('content_pages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('content_pages')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('content_pages')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('content_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('content_pages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
