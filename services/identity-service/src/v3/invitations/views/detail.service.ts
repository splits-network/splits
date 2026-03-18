/**
 * Invitation Detail View Service
 * GET /api/v3/invitations/:id/view/detail
 * GET /api/v3/invitations/views/detail
 *
 * Returns invitation(s) with joined organization and company data.
 * Access: company admins for their org, platform admins for all.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { InvitationDetailViewRepository } from './detail.repository';
import { InvitationListParams } from '../types';

export class InvitationDetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: InvitationDetailViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string, userEmail?: string) {
    const invitation = await this.repository.findById(id);
    if (!invitation) throw new NotFoundError('Invitation', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin &&
        !context.organizationIds.includes(invitation.organization_id) &&
        (!userEmail || userEmail.toLowerCase() !== invitation.email.toLowerCase())) {
      throw new ForbiddenError('You do not have access to this invitation');
    }
    return invitation;
  }

  async getList(params: InvitationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      if (params.organization_id) {
        if (!context.organizationIds.includes(params.organization_id) &&
            !context.roles.includes('company_admin')) {
          throw new ForbiddenError('You do not have access to this organization');
        }
      } else {
        throw new ForbiddenError('Platform admin permissions required');
      }
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
