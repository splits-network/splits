/**
 * Typed Listing View Repository
 *
 * Returns published pages filtered by page_type with their tags.
 * Supports tag filtering and pagination.
 */

import { SupabaseClient } from '@supabase/supabase-js';

const WITH_TAGS_SELECT = '*, content_page_tags(tag:content_tags(*))';

interface TypedListingParams {
  page_type: string;
  app?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export class TypedListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findPublished(params: TypedListingParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('content_pages')
      .select(WITH_TAGS_SELECT, { count: 'exact' })
      .eq('page_type', params.page_type)
      .eq('status', 'published')
      .is('deleted_at', null);

    if (params.app) query = query.eq('app', params.app);

    query = query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    let results = data || [];

    // Client-side tag filter (Supabase doesn't support filtering by nested join values)
    if (params.tag) {
      results = results.filter((page: any) =>
        page.content_page_tags?.some(
          (pt: any) => pt.tag?.slug === params.tag
        )
      );
    }

    // Flatten tags for cleaner response
    const flattened = results.map((page: any) => {
      const { content_page_tags, ...rest } = page;
      return {
        ...rest,
        tags: (content_page_tags || [])
          .map((pt: any) => pt.tag)
          .filter(Boolean),
      };
    });

    return { data: flattened, total: count || 0 };
  }
}
