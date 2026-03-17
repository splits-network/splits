/**
 * Application Detail View Service
 *
 * Full application detail with joins, access control, and optional includes.
 * Moved from core service.getById to follow the view pattern.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { ApplicationDetailRepository } from './detail.repository';

export class ApplicationDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationDetailRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string, include?: string) {
    const application = await this.repository.findById(id, include);
    if (!application) throw new NotFoundError('Application', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      await this.verifyAccess(application, context);
    }

    // Separate-query includes
    if (include?.includes('documents') || include?.includes('document')) {
      application.documents = await this.repository.getDocumentsForApplication(id);
    }
    if (include?.includes('ai_review') || include?.includes('ai-review')) {
      application.ai_review = await this.repository.getAIReviewForApplication(id);
    }

    const companyId = application.job?.company?.id;
    if (companyId) {
      const sourcer = await this.repository.getCompanySourcer(companyId);
      if (sourcer) application.company_sourcer = sourcer;
    }

    return application;
  }

  private async verifyAccess(application: any, context: any) {
    if (context.candidateId === application.candidate_id) return;
    if (context.recruiterId === application.candidate_recruiter_id) return;
    if (context.recruiterId === application.company_recruiter_id) return;

    if (context.recruiterId && application.job_id) {
      const { data: job } = await this.supabase
        .from('jobs').select('job_owner_recruiter_id, source_firm_id')
        .eq('id', application.job_id).single();
      if (job?.job_owner_recruiter_id === context.recruiterId) return;
      if (job?.source_firm_id && context.firmIds?.includes(job.source_firm_id)) return;
    }

    const orgId = application.job?.company?.identity_organization_id;
    if (orgId && context.organizationIds?.includes(orgId)) return;

    throw new ForbiddenError('You do not have access to this application');
  }
}
