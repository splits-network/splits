/**
 * Content Page Tags "with-details" View Repository
 *
 * Joins content_page_tags with content_tags to include tag name/slug.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_DETAILS_SELECT = '*, tag:content_tags(*)';

export class WithDetailsPageTagRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByPageId(pageId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('content_page_tags')
      .select(WITH_DETAILS_SELECT)
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
