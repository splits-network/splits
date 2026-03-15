/**
 * Recruiter-Companies Detail View Service
 * GET /api/v3/recruiter-companies/:id/view/detail
 *
 * Resolves access context and returns the enriched relationship detail.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { RecruiterCompanyDetailRepository } from './detail.repository';

export class RecruiterCompanyDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCompanyDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCompany', id);

    const ctx = await this.accessResolver.resolve(clerkUserId);

    if (ctx.isPlatformAdmin) return rel;

    if (ctx.recruiterId && rel.recruiter_id === ctx.recruiterId) return rel;

    if (ctx.organizationIds.length > 0) {
      const companyOrgMatch = ctx.organizationIds.includes(rel.company?.identity_organization_id);
      if (companyOrgMatch) return rel;
    }

    throw new ForbiddenError('You do not have access to this relationship');
  }
}
