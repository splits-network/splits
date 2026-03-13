/**
 * Placement Detail View Service
 *
 * Access control for the detail view. Checks that the requesting user
 * is a platform admin, the candidate, one of the 5 recruiter roles,
 * or a company user linked to the placement's company.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { PlacementDetailRepository } from './detail.repository';

export class PlacementDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PlacementDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const placement = await this.repository.findById(id);
    if (!placement) throw new NotFoundError('Placement', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      const isCandidate = context.candidateId === placement.candidate_id;

      const isRecruiter = context.recruiterId && [
        placement.candidate_recruiter_id,
        placement.company_recruiter_id,
        placement.job_owner_recruiter_id,
        placement.candidate_sourcer_recruiter_id,
        placement.company_sourcer_recruiter_id,
      ].includes(context.recruiterId);

      const isCompanyUser = context.organizationIds.length > 0 &&
        context.organizationIds.includes(placement.job?.company?.identity_organization_id);

      if (!isCandidate && !isRecruiter && !isCompanyUser) {
        console.warn('[PlacementDetailService.getDetail] Access denied', {
          placementId: id,
          candidateId: context.candidateId,
          recruiterId: context.recruiterId,
          organizationIds: context.organizationIds,
          placementOrgId: placement.job?.company?.identity_organization_id,
          placementRecruiters: {
            candidate: placement.candidate_recruiter_id,
            company: placement.company_recruiter_id,
            jobOwner: placement.job_owner_recruiter_id,
            candidateSourcer: placement.candidate_sourcer_recruiter_id,
            companySourcer: placement.company_sourcer_recruiter_id,
          },
        });
        throw new ForbiddenError('You do not have access to this placement');
      }
    }

    return placement;
  }
}
