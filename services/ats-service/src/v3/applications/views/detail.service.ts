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

    // Enrich candidate with relationship status and flatten skills
    if (application.candidate) {
      application.candidate = this.enrichCandidate(application.candidate, context.recruiterId ?? undefined);
    }

    // Normalize job requirements key and add application count
    if (application.job) {
      if (application.job.job_requirements && !application.job.requirements) {
        application.job.requirements = application.job.job_requirements;
      }
      application.job.application_count = await this.repository.getApplicationCountForJob(application.job_id);
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

  private enrichCandidate(candidate: any, currentRecruiterId?: string) {
    const relationships = candidate.recruiter_relationships || [];

    const hasActiveRelationship = !!currentRecruiterId &&
      relationships.some((rel: any) =>
        rel.recruiter_id === currentRecruiterId &&
        rel.status === 'active' &&
        rel.consent_given
      );

    const hasPendingInvitation = !!currentRecruiterId && !hasActiveRelationship &&
      relationships.some((rel: any) =>
        rel.recruiter_id === currentRecruiterId &&
        !rel.consent_given &&
        !rel.declined_at &&
        rel.status !== 'terminated' &&
        new Date(rel.invitation_expires_at) > new Date()
      );

    const otherRecruiters = new Set(
      relationships
        .filter((rel: any) =>
          rel.status === 'active' &&
          rel.consent_given &&
          (!currentRecruiterId || rel.recruiter_id !== currentRecruiterId)
        )
        .map((rel: any) => rel.recruiter_id)
    );

    return {
      ...candidate,
      recruiter_relationships: undefined,
      has_active_relationship: hasActiveRelationship,
      has_pending_invitation: hasPendingInvitation,
      has_other_active_recruiters: otherRecruiters.size > 0,
    };
  }
}
