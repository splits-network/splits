/**
 * Smart Resume Profiles V3 Repository — Core CRUD
 *
 * Flat queries only. One profile per candidate.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SmartResumeProfileListParams } from './types.js';

export class SmartResumeProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: SmartResumeProfileListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('smart_resume_profiles')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByCandidateId(candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('candidate_id', candidateId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('smart_resume_profiles')
      .insert(record)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('smart_resume_profiles')
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
      .from('smart_resume_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  }
}
