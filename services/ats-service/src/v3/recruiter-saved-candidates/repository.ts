/**
 * Recruiter Saved Candidates V3 Repository — Core CRUD
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterSavedCandidateListParams } from './types';

const SORTABLE_FIELDS = ['created_at'];

export class RecruiterSavedCandidateRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(recruiterId: string, params: RecruiterSavedCandidateListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('recruiter_saved_candidates')
      .select('*', { count: 'exact' })
      .eq('recruiter_id', recruiterId);

    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string, recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .select('*')
      .eq('id', id)
      .eq('recruiter_id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByCandidateId(recruiterId: string, candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(recruiterId: string, candidateId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .insert({ recruiter_id: recruiterId, candidate_id: candidateId } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, recruiterId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .delete()
      .eq('id', id)
      .eq('recruiter_id', recruiterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Returns saved candidate IDs for a recruiter — used for list filtering */
  async findCandidateIdsByRecruiter(recruiterId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .select('candidate_id')
      .eq('recruiter_id', recruiterId);

    if (error) throw error;
    return (data || []).map((r: any) => r.candidate_id);
  }

  /** Count total saved candidates for a recruiter — used for entitlement limit checks */
  async countByRecruiterId(recruiterId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', recruiterId);

    if (error) throw error;
    return count || 0;
  }

  /** Batch check which candidate IDs are saved — used for is_saved enrichment */
  async findSavedMapForCandidates(recruiterId: string, candidateIds: string[]): Promise<Map<string, string>> {
    if (candidateIds.length === 0) return new Map();

    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .select('id, candidate_id')
      .eq('recruiter_id', recruiterId)
      .in('candidate_id', candidateIds);

    if (error) throw error;
    const map = new Map<string, string>();
    (data || []).forEach((r: any) => map.set(r.candidate_id, r.id));
    return map;
  }
}
