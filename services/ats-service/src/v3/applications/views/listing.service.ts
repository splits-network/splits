/**
 * Application Listing View Service
 *
 * Handles role-based scoping, include enrichment (ai_review, documents),
 * and pagination for the joined application listing.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ApplicationListingRepository } from './listing.repository.js';
import { ApplicationListParams } from '../types.js';
import { ApplicationScopeFilters } from '../repository.js';

const COMPANY_VISIBLE_STAGES = [
  'submitted', 'company_review', 'company_feedback',
  'screen', 'interview', 'offer', 'hired', 'rejected',
];

export class ApplicationListingService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationListingRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getListing(params: ApplicationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scope = await this.buildScope(context);

    const { data, total } = await this.repository.findAll(params, scope);

    // Batch-load includes
    if (params.include) {
      const includes = params.include.split(',').map(i => i.trim());
      const ids = data.map((a: any) => a.id);

      if (includes.includes('ai_review') || includes.includes('ai-review')) {
        const reviews = await this.repository.batchGetAIReviews(ids);
        const map = new Map(reviews.map(r => [r.application_id, r]));
        data.forEach((a: any) => { a.ai_review = map.get(a.id) || null; });
      }
      if (includes.includes('documents') || includes.includes('document')) {
        const docs = await this.repository.batchGetDocuments(ids);
        const map = new Map<string, any[]>();
        docs.forEach((d: any) => {
          if (!map.has(d.entity_id)) map.set(d.entity_id, []);
          map.get(d.entity_id)!.push(d);
        });
        data.forEach((a: any) => { a.documents = map.get(a.id) || []; });
      }
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private async buildScope(context: any): Promise<ApplicationScopeFilters> {
    if (context.isPlatformAdmin) return { is_admin: true };

    if (context.candidateId) return { candidate_id: context.candidateId };

    if (context.recruiterId) {
      const viewableJobIds = await this.getViewableJobIds(context.recruiterId, context.firmIds);
      return { recruiter_id: context.recruiterId, viewable_job_ids: viewableJobIds };
    }

    if (context.organizationIds?.length > 0) {
      const jobIds = await this.getCompanyJobIds(context.organizationIds);
      return {
        company_ids: context.organizationIds,
        viewable_job_ids: jobIds,
        visible_stages: COMPANY_VISIBLE_STAGES,
      };
    }

    return {};
  }

  private async getViewableJobIds(recruiterId: string, firmIds: string[] = []): Promise<string[]> {
    const { data: ownedJobs } = await this.supabase
      .from('jobs').select('id, company_id')
      .eq('job_owner_recruiter_id', recruiterId);

    const { data: perms } = await this.supabase
      .from('recruiter_companies').select('company_id, permissions')
      .eq('recruiter_id', recruiterId).eq('status', 'active');

    const viewableCompanyIds = (perms || [])
      .filter(r => r.permissions?.can_view_applications === true)
      .map(r => r.company_id);

    const ownedJobIds = (ownedJobs || [])
      .filter(j => !j.company_id || viewableCompanyIds.includes(j.company_id))
      .map(j => j.id);

    let firmJobIds: string[] = [];
    if (firmIds.length > 0) {
      const { data: firmJobs } = await this.supabase
        .from('jobs').select('id')
        .in('source_firm_id', firmIds);
      firmJobIds = (firmJobs || []).map(j => j.id);
    }

    return [...new Set([...ownedJobIds, ...firmJobIds])];
  }

  private async getCompanyJobIds(orgIds: string[]): Promise<string[]> {
    const { data: companies } = await this.supabase
      .from('companies').select('id').in('identity_organization_id', orgIds);
    if (!companies?.length) return [];
    const { data: jobs } = await this.supabase
      .from('jobs').select('id').in('company_id', companies.map(c => c.id));
    return (jobs || []).map(j => j.id);
  }
}
