/**
 * AI Reviews V3 Repository — Core CRUD
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AIReviewListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'fit_score'];

export class AIReviewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: AIReviewListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('ai_reviews')
      .select('*', { count: 'exact' });

    if (params.application_id) query = query.eq('application_id', params.application_id);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.recommendation) query = query.eq('recommendation', params.recommendation);
    if (params.fit_score_min !== undefined) query = query.gte('fit_score', params.fit_score_min);
    if (params.fit_score_max !== undefined) query = query.lte('fit_score', params.fit_score_max);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upsert(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .upsert(input, { onConflict: 'application_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByApplicationId(applicationId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
