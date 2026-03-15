/**
 * Recruiter-Companies V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompanyListParams, RecruiterCompanyUpdate, RecruiterCompanyPermissions } from './types';

interface ScopeFilters {
  recruiter_id?: string;
  company_ids?: string[];
}

const FLAT_SELECT = '*';

export class RecruiterCompanyRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RecruiterCompanyListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_companies').select(FLAT_SELECT, { count: 'exact' });

    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (scopeFilters?.company_ids?.length) query = query.in('company_id', scopeFilters.company_ids);

    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.company_id) query = query.eq('company_id', params.company_id);
    if (params.relationship_type) query = query.eq('relationship_type', params.relationship_type);
    if (params.status) query = query.eq('status', params.status);

    const SORTABLE_FIELDS = ['created_at', 'updated_at', 'status', 'relationship_type'];
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_companies')
      .select(FLAT_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('recruiter_companies').insert(record).select(FLAT_SELECT).single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('recruiter_companies')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select(FLAT_SELECT).single();
    if (error) throw error;
    return data;
  }

  async hasActiveRelationship(recruiterId: string, companyId: string): Promise<boolean> {
    const { data } = await this.supabase.from('recruiter_companies').select('id')
      .eq('recruiter_id', recruiterId).eq('company_id', companyId).eq('status', 'active').maybeSingle();
    return !!data;
  }

  async hasPendingOrActiveRelationship(recruiterId: string, companyId: string): Promise<boolean> {
    const { data } = await this.supabase.from('recruiter_companies').select('id')
      .eq('recruiter_id', recruiterId).eq('company_id', companyId).in('status', ['active', 'pending']).maybeSingle();
    return !!data;
  }

  async getPermissions(recruiterId: string, companyId: string): Promise<RecruiterCompanyPermissions | null> {
    const { data, error } = await this.supabase.from('recruiter_companies').select('permissions')
      .eq('recruiter_id', recruiterId).eq('company_id', companyId).eq('status', 'active').maybeSingle();
    if (error) throw error;
    return data?.permissions || null;
  }

  async getAllPermissionsForRecruiter(recruiterId: string): Promise<{ company_id: string; company_name: string; permissions: RecruiterCompanyPermissions }[]> {
    const { data, error } = await this.supabase.from('recruiter_companies')
      .select('company_id, permissions, company:companies!inner(name)')
      .eq('recruiter_id', recruiterId).eq('status', 'active');
    if (error) throw error;
    return (data || []).map(row => ({ company_id: row.company_id, company_name: (row.company as any)?.name || '', permissions: row.permissions }));
  }

}
