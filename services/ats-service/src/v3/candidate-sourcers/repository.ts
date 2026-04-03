/**
 * Candidate Sourcers V3 Repository — Core CRUD
 *
 * Single table queries only. NO role logic.
 * Role scoping and authorization happen in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateSourcerListParams } from './types.js';

export class CandidateSourcerRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CandidateSourcerListParams,
    scopeFilters?: { recruiter_id?: string; candidate_ids?: string[] }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidate_sourcers')
      .select('*', { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.recruiter_id) {
      query = query.eq('sourcer_recruiter_id', scopeFilters.recruiter_id);
    }
    if (scopeFilters?.candidate_ids && scopeFilters.candidate_ids.length > 0) {
      query = query.in('candidate_id', scopeFilters.candidate_ids);
    }

    // User-supplied filters
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.recruiter_id) query = query.eq('sourcer_recruiter_id', params.recruiter_id);

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidate_sourcers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByCandidateId(candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidate_sourcers')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('candidate_sourcers')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidate_sourcers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('candidate_sourcers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async isSourcerActive(recruiterId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('recruiters')
      .select('id, status')
      .eq('id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return !!data && data.status !== 'deactivated';
  }
}
