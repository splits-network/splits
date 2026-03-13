/**
 * Assignments V3 Repository — Pure Data Layer
 *
 * NO role logic. Scope filters passed from service.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AssignmentListParams } from './types';

interface ScopeFilters {
  recruiter_id?: string;
  organization_ids?: string[];
}

export class AssignmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: AssignmentListParams,
    scopeFilters?: ScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('role_assignments')
      .select(`
        *,
        recruiter:recruiters(id, name, email),
        job:jobs(id, title, company:companies!inner(id, name, identity_organization_id))
      `, { count: 'exact' });

    if (scopeFilters?.recruiter_id) {
      query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    }
    if (scopeFilters?.organization_ids?.length) {
      query = query.in('job.company.identity_organization_id', scopeFilters.organization_ids);
    }

    if (params.status) query = query.eq('status', params.status);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.job_id) query = query.eq('job_id', params.job_id);

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('role_assignments')
      .select(`
        *,
        recruiter:recruiters(id, name, email),
        job:jobs(id, title, company:companies(id, name))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('role_assignments')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('role_assignments')
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
      .from('role_assignments')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
