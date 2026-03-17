/**
 * Automation Executions V3 Repository — Read + Update only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ExecutionListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'status'];

export class ExecutionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ExecutionListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('automation_executions').select('*', { count: 'exact' });
    if (params.rule_id) query = query.eq('rule_id', params.rule_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.requires_approval !== undefined) query = query.eq('requires_approval', params.requires_approval);
    if (params.entity_type) query = query.eq('entity_type', params.entity_type);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('automation_executions').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('automation_executions').insert(input).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('automation_executions')
      .update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
}
