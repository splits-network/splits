/**
 * Jobs V3 Repository — Core CRUD
 *
 * Single table queries only. NO joins, NO role logic.
 * Role scoping and authorization happen in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'title', 'status', 'updated_at', 'salary_min', 'salary_max'];

const SELECTABLE_FIELDS = [
  'id', 'title', 'status', 'location', 'department', 'employment_type',
  'salary_min', 'salary_max', 'fee_percentage', 'guarantee_days',
  'description', 'recruiter_description', 'candidate_description',
  'commute_types', 'job_level', 'open_to_relocation', 'show_salary_range',
  'company_id', 'source_firm_id', 'job_owner_recruiter_id',
  'pre_screen_questions',
  'is_early_access', 'is_priority',
  'activates_at', 'closes_at', 'created_at', 'updated_at',
];

export class JobRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: JobListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    // Validate fields param against allowlist
    let selectFields = '*';
    if (params.fields) {
      const requested = params.fields.split(',').map(f => f.trim());
      const valid = requested.filter(f => SELECTABLE_FIELDS.includes(f));
      if (valid.length > 0) selectFields = valid.join(',');
    }

    let query = this.supabase
      .from('jobs')
      .select(selectFields, { count: 'exact' });

    // User-supplied filters only — no role-based scoping
    if (params.status) query = query.eq('status', params.status);
    if (params.employment_type) query = query.eq('employment_type', params.employment_type);
    if (params.company_id) query = query.eq('company_id', params.company_id);
    if (params.job_level) query = query.eq('job_level', params.job_level);
    if (params.location && !params.search) {
      query = query.ilike('location', `%${params.location}%`);
    }

    if (params.commute_type) {
      const types = Array.isArray(params.commute_type) ? params.commute_type : [params.commute_type];
      query = query.overlaps('commute_types', types);
    }

    // Full-text search
    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(Boolean).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }

    // Sorting (validated against allowlist)
    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(jobData: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
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

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
