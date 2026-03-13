/**
 * Pre-Screen V3 Repository — Pure Data Layer
 *
 * Queries jobs.pre_screen_questions and applications.pre_screen_answers.
 * NO role logic — role scoping happens in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PreScreenListParams, PreScreenQuestion } from './types';

export class PreScreenRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * List jobs with their pre-screen questions.
   * scopeFilters constrain visibility by role (set by service layer).
   */
  async findAll(
    params: PreScreenListParams,
    scopeFilters?: { company_ids?: string[]; recruiter_id?: string }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('jobs')
      .select('id, title, company_id, pre_screen_questions, status, created_at', { count: 'exact' });

    // Role-based scoping
    if (scopeFilters?.company_ids && scopeFilters.company_ids.length > 0) {
      query = query.in('company_id', scopeFilters.company_ids);
    }
    if (scopeFilters?.recruiter_id) {
      query = query.eq('job_owner_recruiter_id', scopeFilters.recruiter_id);
    }

    // User-supplied filters
    if (params.job_id) query = query.eq('id', params.job_id);
    if (params.has_questions === 'yes') {
      query = query.not('pre_screen_questions', 'eq', '[]');
      query = query.not('pre_screen_questions', 'is', null);
    } else if (params.has_questions === 'no') {
      query = query.or('pre_screen_questions.is.null,pre_screen_questions.eq.[]');
    }

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  /**
   * Get pre-screen questions for a specific job.
   */
  async findById(jobId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('id, title, company_id, source_firm_id, job_owner_recruiter_id, pre_screen_questions, status')
      .eq('id', jobId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Set pre-screen questions on a job (create/replace).
   */
  async create(jobId: string, questions: PreScreenQuestion[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .update({ pre_screen_questions: questions })
      .eq('id', jobId)
      .select('id, title, company_id, pre_screen_questions, status')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update (replace) pre-screen questions on a job.
   */
  async update(jobId: string, questions: PreScreenQuestion[]): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .update({ pre_screen_questions: questions })
      .eq('id', jobId)
      .select('id, title, company_id, pre_screen_questions, status')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Clear all pre-screen questions from a job.
   */
  async delete(jobId: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .update({ pre_screen_questions: [] })
      .eq('id', jobId);

    if (error) throw error;
  }

  /**
   * Get pre-screen answers for a specific application.
   */
  async findAnswersByApplicationId(applicationId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('id, job_id, candidate_id, candidate_recruiter_id, pre_screen_answers, stage')
      .eq('id', applicationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
