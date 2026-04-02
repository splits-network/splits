/**
 * Smart Resume Experiences V3 Repository -- Core CRUD
 *
 * Flat queries only against smart_resume_experiences table.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SmartResumeExperienceListParams } from './types.js';

export class SmartResumeExperienceRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: SmartResumeExperienceListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('smart_resume_experiences')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .eq('profile_id', params.profile_id);

    query = query.order('sort_order', { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_experiences')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('smart_resume_experiences')
      .insert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_experiences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('smart_resume_experiences')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  }
}
