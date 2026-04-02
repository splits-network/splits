/**
 * Fraud Signals V3 Repository — Core CRUD
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { FraudSignalListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'severity', 'confidence_score'];

export class FraudSignalRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: FraudSignalListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('fraud_signals').select('*', { count: 'exact' }).is('deleted_at', null);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.severity) query = query.eq('severity', params.severity);
    if (params.status) query = query.eq('status', params.status);
    if (params.signal_type) query = query.eq('signal_type', params.signal_type);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('fraud_signals').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('fraud_signals').insert(input).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('fraud_signals')
      .update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('fraud_signals')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
}
