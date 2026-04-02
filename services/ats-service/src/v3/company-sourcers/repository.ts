/**
 * Company Sourcers V3 Repository — Core CRUD
 *
 * Single table queries only. NO role logic.
 * Role scoping and authorization happen in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanySourcerListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'sourced_at', 'protection_expires_at'];

export class CompanySourcerRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CompanySourcerListParams,
    scopeFilters?: { recruiter_id?: string; company_ids?: string[] }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('company_sourcers')
      .select('*', { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.recruiter_id) {
      query = query.eq('sourcer_recruiter_id', scopeFilters.recruiter_id);
    }
    if (scopeFilters?.company_ids && scopeFilters.company_ids.length > 0) {
      query = query.in('company_id', scopeFilters.company_ids);
    }

    // User-supplied filters
    if (params.company_id) query = query.eq('company_id', params.company_id);
    if (params.recruiter_id) query = query.eq('sourcer_recruiter_id', params.recruiter_id);

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('company_sourcers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByCompanyId(companyId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('company_sourcers')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_sourcers')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('company_sourcers')
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
      .from('company_sourcers')
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
