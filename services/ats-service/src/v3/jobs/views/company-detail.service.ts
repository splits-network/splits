/**
 * Company Detail View Service
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyDetailRepository } from './company-detail.repository';

export class CompanyDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (context.organizationIds.length === 0 && !context.isPlatformAdmin) {
      throw new ForbiddenError('Company role required for this view');
    }

    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    // Verify org access (unless admin)
    if (!context.isPlatformAdmin && job.company) {
      const orgId = await this.repository.getCompanyOrgId(job.company.id);
      if (!orgId || !context.organizationIds.includes(orgId)) {
        throw new ForbiddenError('Access denied to this job');
      }
    }

    const [requirements, skills, stageBreakdown] = await Promise.all([
      this.repository.findRequirements(id),
      this.repository.findSkills(id),
      this.repository.getApplicationStageBreakdown(id),
    ]);

    // Get recruiter name if assigned
    const recruiterName = job.job_owner_recruiter_id
      ? await this.repository.getRecruiterName(job.job_owner_recruiter_id)
      : null;

    const application_count = stageBreakdown.reduce((sum, s) => sum + s.count, 0);

    return {
      ...job,
      requirements,
      skills,
      application_count,
      application_stages: stageBreakdown,
      posted_by_recruiter: recruiterName,
    };
  }
}
