/**
 * Content Images V3 Repository — Core CRUD
 *
 * Single table queries on content_images. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ImageListParams } from './types.js';

export class ImageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: ImageListParams,
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('content_images')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,alt_text.ilike.%${params.search}%`);
    }
    if (params.mime_type) query = query.eq('mime_type', params.mime_type);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('content_images')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('content_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('content_images')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
