/**
 * Application Listing View Repository
 *
 * GET /api/v3/applications/views/listing
 *
 * Returns applications with joined candidate, job, company, firm, and sourcer
 * data. Supports batch includes (ai_review, documents) and role-based scoping.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationListParams } from '../types.js';
import { ApplicationScopeFilters } from '../repository.js';

const LIST_SELECT = `*,
  candidate:candidates(id, full_name, email, phone, location, user_id,
    candidate_sourcer:candidate_sourcers(sourcer_recruiter_id,
      recruiter:recruiters(id, user_id, user:users!recruiters_user_id_fkey(name, email)))),
  job:jobs(*, company:companies(id, name, website, industry, company_size, headquarters_location,
    description, logo_url, identity_organization_id),
    firm:firms(id, name, logo_url),
    job_requirements:job_requirements(*))`;

export class ApplicationListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: ApplicationListParams,
    scopeFilters?: ApplicationScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('applications')
      .select(LIST_SELECT, { count: 'exact' });

    // Apply scope filters from service layer
    query = this.applyScope(query, scopeFilters);

    // User-supplied filters
    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-\/:]/g, ' ').trim()
        .split(/\s+/).filter((t: string) => t).join(' & ');
      query = query.textSearch('search_vector', tsquery, {
        type: 'websearch', config: 'english',
      });
    }
    if (params.stage) query = query.eq('stage', params.stage);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.recruiter_id) {
      query = query.or(
        `candidate_recruiter_id.eq.${params.recruiter_id},company_recruiter_id.eq.${params.recruiter_id}`
      );
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async batchGetAIReviews(applicationIds: string[]): Promise<any[]> {
    if (!applicationIds.length) return [];
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .select('*')
      .in('application_id', applicationIds);
    if (error) throw error;
    return data || [];
  }

  async batchGetDocuments(applicationIds: string[]): Promise<any[]> {
    if (!applicationIds.length) return [];
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'application')
      .in('entity_id', applicationIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(doc => ({
      ...doc,
      file_name: doc.filename,
      file_url: doc.storage_path,
      uploaded_at: doc.created_at,
      is_primary: doc.metadata?.is_primary || false,
    }));
  }

  private applyScope(query: any, scope?: ApplicationScopeFilters): any {
    if (!scope || scope.is_admin) return query;

    if (scope.candidate_id) {
      return query.eq('candidate_id', scope.candidate_id);
    }

    if (scope.recruiter_id) {
      const parts = [
        `candidate_recruiter_id.eq.${scope.recruiter_id}`,
        `company_recruiter_id.eq.${scope.recruiter_id}`,
      ];
      if (scope.viewable_job_ids && scope.viewable_job_ids.length > 0) {
        parts.push(`job_id.in.(${scope.viewable_job_ids.join(',')})`);
      }
      return query.or(parts.join(','));
    }

    if (scope.company_ids && scope.company_ids.length > 0) {
      if (!scope.viewable_job_ids || scope.viewable_job_ids.length === 0) {
        return query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
      query = query.in('job_id', scope.viewable_job_ids);
      if (scope.visible_stages) {
        query = query.in('stage', scope.visible_stages);
      }
      return query;
    }

    // Fallback: return nothing
    return query.eq('id', '00000000-0000-0000-0000-000000000000');
  }
}
