/**
 * ATS Integrations V3 Repository — Core CRUD
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ATSListParams } from './types';

const SORTABLE_FIELDS = ['created_at', 'platform'];

export class ATSIntegrationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ATSListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('ats_integrations')
      .select('*', { count: 'exact' });

    if (params.company_id) query = query.eq('company_id', params.company_id);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('ats_integrations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('ats_integrations')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('ats_integrations')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ats_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
