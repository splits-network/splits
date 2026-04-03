/**
 * Jobs Scoped List View Repository
 *
 * Applies role-based scoping (company IDs, status visibility,
 * early access filtering) to job listings. Used by the service
 * getAll endpoint for authenticated, scoped job queries.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobListParams } from '../types.js';

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

export interface ScopedJobListParams extends JobListParams {
  scoped_company_ids?: string[];
  visible_statuses?: string[];
  owner_recruiter_id?: string;
  exclude_early_access?: boolean;
}

export class ScopedJobListRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: ScopedJobListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let selectFields = '*';
    if (params.fields) {
      const requested = params.fields.split(',').map(f => f.trim());
      const valid = requested.filter(f => SELECTABLE_FIELDS.includes(f));
      if (valid.length > 0) selectFields = valid.join(',');
    }

    let query = this.supabase
      .from('jobs')
      .select(selectFields, { count: 'exact' });

    // Role-based scoping
    if (params.scoped_company_ids && params.scoped_company_ids.length > 0) {
      query = query.in('company_id', params.scoped_company_ids);
    }
    if (params.visible_statuses && params.visible_statuses.length > 0) {
      if (params.owner_recruiter_id) {
        query = query.or(
          `status.in.(${params.visible_statuses.join(',')}),job_owner_recruiter_id.eq.${params.owner_recruiter_id}`
        );
      } else {
        query = query.in('status', params.visible_statuses);
      }
    }
    if (params.exclude_early_access) {
      query = query.eq('is_early_access', false);
    }

    // User-supplied filters
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

    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(Boolean).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
