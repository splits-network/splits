/**
 * Reports V3 Repository -- Core CRUD
 *
 * Flat select('*') on chat_reports. NO joins, NO role logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatReport, ReportListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'updated_at', 'status'];

export class ReportRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ReportListParams): Promise<{ data: ChatReport[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('chat_reports')
      .select('*', { count: 'exact' });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const sortAscending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending: sortAscending });

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []) as ChatReport[], total: count || 0 };
  }

  async findById(id: string): Promise<ChatReport | null> {
    const { data, error } = await this.supabase
      .from('chat_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ChatReport | null;
  }

  async create(record: Record<string, any>): Promise<ChatReport> {
    const { data, error } = await this.supabase
      .from('chat_reports')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as ChatReport;
  }

  async update(id: string, updates: Record<string, any>): Promise<ChatReport> {
    const { data, error } = await this.supabase
      .from('chat_reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChatReport;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_reports')
      .update({ status: 'dismissed', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
