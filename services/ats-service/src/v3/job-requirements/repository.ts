/**
 * Job Requirements V3 Repository — Core CRUD
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobRequirementListParams } from './types.js';

export class JobRequirementRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: JobRequirementListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    const offset = (page - 1) * limit;

    const { data, count, error } = await this.supabase
      .from('job_requirements')
      .select('*', { count: 'exact' })
      .eq('job_id', params.job_id)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('job_requirements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(payload: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('job_requirements')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, payload: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('job_requirements')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_requirements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
