/**
 * Membership Detail View Service
 * GET /api/v3/memberships/:id/view/detail
 * GET /api/v3/memberships/views/detail
 *
 * Returns membership(s) with joined user, organization, company, and role data.
 * Access: scoped by user context (same as CRUD service).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { MembershipDetailViewRepository } from './detail.repository';
import { MembershipListParams } from '../types';

export class MembershipDetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MembershipDetailViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const membership = await this.repository.findById(id);
    if (!membership) throw new NotFoundError('Membership', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      if (!context.organizationIds.includes(membership.organization_id)) {
        throw new ForbiddenError('You do not have access to this membership');
      }
    }
    return membership;
  }

  async getList(params: MembershipListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { user_id?: string; organization_ids?: string[] } = {};

    if (!context.isPlatformAdmin) {
      if (params.company_id) {
        // Any authenticated user can view members of a company
      } else if (params.organization_id) {
        if (!context.organizationIds.includes(params.organization_id)) {
          throw new ForbiddenError('You do not have access to this organization');
        }
      } else {
        scopeFilters.user_id = context.identityUserId as string;
      }
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
