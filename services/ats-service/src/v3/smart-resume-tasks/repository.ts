/**
 * Smart Resume Tasks V3 Repository -- Core CRUD
 *
 * Flat queries only against smart_resume_tasks table.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SmartResumeTaskListParams } from './types.js';

export class SmartResumeTaskRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: SmartResumeTaskListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('smart_resume_tasks')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .eq('profile_id', params.profile_id);

    if (params.experience_id) query = query.eq('experience_id', params.experience_id);
    if (params.project_id) query = query.eq('project_id', params.project_id);

    query = query.order('sort_order', { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('smart_resume_tasks')
      .insert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_tasks')
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
      .from('smart_resume_tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  }
}
