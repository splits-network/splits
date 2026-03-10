/**
 * Saved Jobs V3 Repository — Core CRUD
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SavedJobListParams } from './types';

const SORTABLE_FIELDS = ['created_at'];

export class SavedJobRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(candidateId: string, params: SavedJobListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidate_saved_jobs')
      .select('*', { count: 'exact' })
      .eq('candidate_id', candidateId);

    if (params.job_id) query = query.eq('job_id', params.job_id);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string, candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidate_saved_jobs')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByJobId(candidateId: string, jobId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidate_saved_jobs')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(candidateId: string, jobId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('candidate_saved_jobs')
      .insert({ candidate_id: candidateId, job_id: jobId } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, candidateId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('candidate_saved_jobs')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
