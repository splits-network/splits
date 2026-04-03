/**
 * Job Recommendations V3 Repository
 * Core CRUD — flat queries only, no joins.
 * For joined data (job + candidate), use views/detail.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobRecommendationListParams } from './types.js';

export class JobRecommendationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: JobRecommendationListParams,
    scopeFilter?: { candidate_id?: string }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('job_recommendations')
      .select('*', { count: 'exact' });

    // Scope filtering (from access context)
    if (scopeFilter?.candidate_id) {
      query = query.eq('candidate_id', scopeFilter.candidate_id);
    }

    // User-provided filters
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.status) query = query.eq('status', params.status);

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('job_recommendations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async create(input: { job_id: string; candidate_id: string; recommended_by: string; message?: string }): Promise<any> {
    const { data, error } = await this.supabase
      .from('job_recommendations')
      .insert(input)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('job_recommendations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async findByJobAndCandidate(jobId: string, candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('job_recommendations')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findForCandidate(
    candidateId: string,
    statuses?: string[]
  ): Promise<{ data: any[]; total: number }> {
    let query = this.supabase
      .from('job_recommendations')
      .select(`
        *,
        job:jobs(id, title, location, employment_type, company:companies(id, name, logo_url)),
        recommender:users!job_recommendations_recommended_by_fkey(id, name)
      `, { count: 'exact' })
      .eq('candidate_id', candidateId);

    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses);
    }

    query = query.order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
