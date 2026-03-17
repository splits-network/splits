/**
 * Detail View Service — Job Recommendations
 * Access control: candidate owns it, company user owns the job, or platform admin.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { JobRecommendationDetailRepository } from './detail.repository';

export class JobRecommendationDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: JobRecommendationDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('JobRecommendation', id);

    if (!context.isPlatformAdmin) {
      const isCandidate = context.candidateId === item.candidate_id;
      const isCompanyUser = context.organizationIds?.includes(item.job?.company_id);
      if (!isCandidate && !isCompanyUser) {
        throw new ForbiddenError('You do not have access to this recommendation');
      }
    }

    return item;
  }
}
