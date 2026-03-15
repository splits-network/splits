/**
 * Reputation V3 Repository — Pure Data Layer
 *
 * NO role logic. Scope filters passed in from service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ReputationListParams, ReputationUpdate } from './types';

export class ReputationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ReputationListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('recruiter_reputation')
      .select('*, recruiter:recruiters(id, name, email)', { count: 'exact' });

    if (params.recruiter_id) {
      query = query.eq('recruiter_id', params.recruiter_id);
    }

    const sortBy = params.sort_by || 'reputation_score';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_reputation')
      .select('*, recruiter:recruiters(id, name, email)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByRecruiterId(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_reputation')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('recruiter_reputation')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_reputation')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
      .from('recruiter_reputation')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
