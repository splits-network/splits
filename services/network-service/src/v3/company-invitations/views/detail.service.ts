/**
 * Detail View Service
 * Resolves access context and returns invitation with recruiter details.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { CompanyInvitationDetailRepository } from './detail.repository.js';

export class CompanyInvitationDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyInvitationDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.recruiterId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Recruiter or admin role required for this view');
    }

    const invitation = await this.repository.findById(id);
    if (!invitation) throw new NotFoundError('CompanyInvitation', id);

    // Scope check: recruiters can only view their own invitations
    if (!context.isPlatformAdmin && context.recruiterId !== invitation.recruiter_id) {
      throw new ForbiddenError('You do not have access to this invitation');
    }

    return invitation;
  }
}
