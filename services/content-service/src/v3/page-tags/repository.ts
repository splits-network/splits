/**
 * Content Page Tags V3 Repository — Junction CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class PageTagRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByPageId(pageId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('content_page_tags')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('content_page_tags')
      .upsert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(pageId: string, tagId: string): Promise<void> {
    const { error } = await this.supabase
      .from('content_page_tags')
      .delete()
      .eq('page_id', pageId)
      .eq('tag_id', tagId);

    if (error) throw error;
  }

  async bulkReplace(
    pageId: string,
    tags: Array<{ tag_id: string }>
  ): Promise<any[]> {
    const { error: deleteError } = await this.supabase
      .from('content_page_tags')
      .delete()
      .eq('page_id', pageId);

    if (deleteError) throw deleteError;
    if (tags.length === 0) return [];

    const rows = tags.map(t => ({
      page_id: pageId,
      tag_id: t.tag_id,
    }));

    const { data, error } = await this.supabase
      .from('content_page_tags')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
