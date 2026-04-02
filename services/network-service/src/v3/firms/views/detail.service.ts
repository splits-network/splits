/**
 * Firm Detail View Service
 * GET /api/v3/firms/:id/view/detail
 *
 * Returns enriched firm data with access control.
 * Access: platform admins, firm members (recruiter), company users linked to firm.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { FirmDetailViewRepository } from './detail.repository.js';

export class FirmDetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: FirmDetailViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const firm = await this.repository.findById(id);
    if (!firm) throw new NotFoundError('Firm', id);

    const ctx = await this.accessResolver.resolve(clerkUserId);

    if (ctx.isPlatformAdmin) return firm;

    // Recruiter: must be an active member of this firm
    if (ctx.recruiterId) {
      const isMember = (firm.members || []).some(
        (m: any) => m.recruiter?.id === ctx.recruiterId && m.status === 'active'
      );
      if (isMember) return firm;
    }

    // Company user: organizationIds must include the firm's billing org
    if (ctx.organizationIds.length > 0 && firm.billing_organization_id) {
      if (ctx.organizationIds.includes(firm.billing_organization_id)) return firm;
    }

    throw new ForbiddenError('You do not have access to this firm');
  }
}
