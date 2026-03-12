/**
 * Recruiter Saved Jobs V3 Repository — Core CRUD
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterSavedJobListParams } from './types';

const SORTABLE_FIELDS = ['created_at'];

export class RecruiterSavedJobRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(recruiterId: string, params: RecruiterSavedJobListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('recruiter_saved_jobs')
      .select('*', { count: 'exact' })
      .eq('recruiter_id', recruiterId);

    if (params.job_id) query = query.eq('job_id', params.job_id);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string, recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_jobs')
      .select('*')
      .eq('id', id)
      .eq('recruiter_id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByJobId(recruiterId: string, jobId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_jobs')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(recruiterId: string, jobId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_jobs')
      .insert({ recruiter_id: recruiterId, job_id: jobId } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, recruiterId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_jobs')
      .delete()
      .eq('id', id)
      .eq('recruiter_id', recruiterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Returns saved job IDs for a recruiter — used for list filtering */
  async findJobIdsByRecruiter(recruiterId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_jobs')
      .select('job_id')
      .eq('recruiter_id', recruiterId);

    if (error) throw error;
    return (data || []).map((r: any) => r.job_id);
  }

  /** Batch check which job IDs are saved — used for is_saved enrichment */
  async findSavedMapForJobs(recruiterId: string, jobIds: string[]): Promise<Map<string, string>> {
    if (jobIds.length === 0) return new Map();

    const { data, error } = await this.supabase
      .from('recruiter_saved_jobs')
      .select('id, job_id')
      .eq('recruiter_id', recruiterId)
      .in('job_id', jobIds);

    if (error) throw error;
    const map = new Map<string, string>();
    (data || []).forEach((r: any) => map.set(r.job_id, r.id));
    return map;
  }
}
