/**
 * Automation Rules V3 Repository — Core CRUD
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RuleListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'name', 'status'];

export class RuleRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RuleListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('automation_rules').select('*', { count: 'exact' }).is('deleted_at', null);
    if (params.rule_type) query = query.eq('rule_type', params.rule_type);
    if (params.status) query = query.eq('status', params.status);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('automation_rules').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('automation_rules').insert(input).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('automation_rules')
      .update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('automation_rules')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
}
