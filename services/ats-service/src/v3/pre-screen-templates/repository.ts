/**
 * Pre-Screen Templates V3 Repository — Core CRUD
 *
 * Single table queries only. NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TemplateListParams } from './types.js';

const TABLE = 'pre_screen_question_templates';

export class PreScreenTemplateRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: TemplateListParams
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' });

    // Filter by category
    if (params.category) {
      query = query.eq('category', params.category);
    }

    // Return system templates + company templates for the given company
    if (params.company_id) {
      query = query.or(`is_system.eq.true,company_id.eq.${params.company_id}`);
    } else {
      query = query.eq('is_system', true);
    }

    // Text search on label or question
    if (params.q) {
      const term = `%${params.q.trim()}%`;
      query = query.or(`label.ilike.${term},question.ilike.${term}`);
    }

    query = query.order('sort_order').order('label').range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
